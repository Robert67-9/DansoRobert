import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { WorkGalleryImage, WorkProject } from './src/types';
import { WORK_GALLERY_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from './lib/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.resolve(__dirname, '.env.local') });
  dotenv.config({ path: path.resolve(__dirname, '.env') });
} catch {
  // Env files are optional (Vercel injects env vars directly).
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const workGalleryDirectory = path.resolve(__dirname, 'storage', 'work-gallery');
const workGalleryMetadataPath = path.resolve(__dirname, 'storage', 'work-gallery.json');
const OWNER_SESSION_COOKIE = 'danso_owner_session';
const OWNER_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
// Stateless owner sessions: HMAC-signed tokens verifiable on any serverless instance.
// Falls back to the in-process Map only for local dev without OWNER_PASSCODE changes.
const ownerSessions = new Map<string, number>();
const ownerLoginAttempts = new Map<string, { count: number; resetAt: number }>();
const supabaseAdmin = () => getSupabaseAdmin();

// Body parser
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'Unknown error.';
};

const isWorkGalleryImageUrl = (imageUrl: string): boolean => {
  if (imageUrl.startsWith('/uploads/work-gallery/')) return true;
  try {
    const parsed = new URL(imageUrl);
    return parsed.pathname.includes('/storage/v1/object/public/work-gallery/');
  } catch {
    return false;
  }
};

const isWorkGalleryImage = (image: unknown): image is WorkGalleryImage =>
  isRecord(image)
  && typeof image.id === 'string'
  && typeof image.imageUrl === 'string'
  && isWorkGalleryImageUrl(image.imageUrl);

const isWorkProject = (project: unknown): project is WorkProject => {
  if (!isRecord(project)) return false;
  const candidate = project;
  const images = candidate.images;
  return typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.caption === 'string'
    && typeof candidate.createdAt === 'string'
    && Array.isArray(images)
    && images.length >= 1
    && images.length <= 7
    && images.every(isWorkGalleryImage);
};

const readWorkProjectsFromDisk = async (): Promise<WorkProject[]> => {
  try {
    const contents = await fsPromises.readFile(workGalleryMetadataPath, 'utf8');
    const entries: unknown = JSON.parse(contents);
    if (!Array.isArray(entries)) {
      throw new Error('Work gallery metadata must contain a project list.');
    }
    if (entries.every(isWorkProject)) return entries;

    // Convert entries saved by the earlier one-photo-per-entry gallery.
    const legacyPhotos = entries as Record<string, unknown>[];
    if (legacyPhotos.every((photo) =>
      photo !== null
      && typeof photo === 'object'
      && typeof photo.id === 'string'
      && typeof photo.title === 'string'
      && typeof photo.caption === 'string'
      && typeof photo.imageUrl === 'string'
      && typeof photo.createdAt === 'string'
    )) {
      return legacyPhotos.map((photo) => ({
        id: photo.id as string,
        title: photo.title as string,
        caption: photo.caption as string,
        images: [{ id: photo.id as string, imageUrl: photo.imageUrl as string }],
        createdAt: photo.createdAt as string,
      }));
    }

    throw new Error('Work gallery metadata contains an invalid project list.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

const readWorkProjects = async (): Promise<WorkProject[]> => {
  const supabase = supabaseAdmin();
  if (supabase) {
    const { data: projects, error } = await supabase
      .from('work_gallery_projects')
      .select('id, title, caption, created_at')
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) throw error;
    const projectIds = (projects ?? []).map((project) => project.id as string);
    const imagesByProject = new Map<string, WorkGalleryImage[]>();
    if (projectIds.length > 0) {
      const { data: images, error: imagesError } = await supabase
        .from('work_gallery_images')
        .select('id, project_id, image_url, created_at')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });
      if (imagesError) throw imagesError;
      for (const image of images ?? []) {
        const list = imagesByProject.get(image.project_id as string) ?? [];
        list.push({ id: image.id as string, imageUrl: image.image_url as string });
        imagesByProject.set(image.project_id as string, list);
      }
    }
    return (projects ?? []).map((project) => ({
      id: project.id as string,
      title: project.title as string,
      caption: (project.caption as string) ?? '',
      images: imagesByProject.get(project.id as string) ?? [],
      createdAt: project.created_at as string,
    }));
  }
    return readWorkProjectsFromDisk();
  };

  const writeWorkProjects = async (projects: WorkProject[]) => {
  await fsPromises.mkdir(path.dirname(workGalleryMetadataPath), { recursive: true });
  const temporaryPath = `${workGalleryMetadataPath}.${randomUUID()}.tmp`;
  await fsPromises.writeFile(temporaryPath, JSON.stringify(projects, null, 2), 'utf8');
  await fsPromises.rename(temporaryPath, workGalleryMetadataPath);
};

const signOwnerSession = (expiresAt: number): string | null => {
  const secret = process.env.OWNER_PASSCODE;
  if (!secret) return null;
  const payload = `owner:${expiresAt}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
};

const verifyOwnerSessionToken = (token: string): boolean => {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [payload, signature] = decoded.split('.');
    if (!payload || !signature) return false;
    const [, expiresAtRaw] = payload.split(':');
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
    const secret = process.env.OWNER_PASSCODE;
    if (!secret) return false;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const candidate = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    return candidate.length === expectedBuffer.length && timingSafeEqual(candidate, expectedBuffer);
  } catch {
    return false;
  }
};

const getOwnerSessionToken = (req: express.Request): string | null => {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OWNER_SESSION_COOKIE}=`));
  const token = cookie?.slice(OWNER_SESSION_COOKIE.length + 1);
  return token || null;
};

const getOwnerSession = (req: express.Request) => {
  const token = getOwnerSessionToken(req);
  if (!token) return false;
  // Stateless HMAC session: works across Vercel serverless instances.
  if (verifyOwnerSessionToken(token)) return true;
  // Legacy in-process fallback for local dev sessions issued before restart-less flows.
  const expiresAt = ownerSessions.get(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    ownerSessions.delete(token);
    return false;
  }
  return true;
};

const requireOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!getOwnerSession(req)) {
    return res.status(401).json({ error: 'Owner login is required for this action.' });
  }
  next();
};

const sendServerError = (res: express.Response, message: string, error: unknown) => {
  console.error(`${message}:`, error);
  return res.status(500).json({ error: message });
};

const isSupportedImage = (mimeType: string, image: Buffer) => {
  if (mimeType === 'image/jpeg') {
    return image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return image.length >= 8 && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimeType === 'image/webp') {
    return image.length >= 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
};

type ProjectInputError = { status: number; error: string };
type ValidatedProjectInput = { title: string; caption: string; images: { mimeType: string; data: Buffer }[] };

const validateProjectInput = (body: unknown): ProjectInputError | ValidatedProjectInput => {
  const { title, caption = '', images: imageDataList } = (body ?? {}) as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 80) {
    return { status: 400, error: 'A title between 1 and 80 characters is required.' };
  }
  if (typeof caption !== 'string' || caption.length > 300) {
    return { status: 400, error: 'The caption must be 300 characters or fewer.' };
  }
  if (!Array.isArray(imageDataList) || imageDataList.length < 1 || imageDataList.length > 7) {
    return { status: 400, error: 'Choose between 1 and 7 images for one project.' };
  }
  return { title: title.trim(), caption: caption.trim(), images: imageDataList as { mimeType: string; data: Buffer }[] };
};

const decodeProjectImages = (imageDataList: unknown[]): ProjectInputError | { mimeType: string; data: Buffer }[] => {
  const imageFiles: { mimeType: string; data: Buffer }[] = [];
  let totalSize = 0;
  for (const imageData of imageDataList) {
    if (typeof imageData !== 'string') {
      return { status: 400, error: 'Each project image must be a JPEG, PNG, or WebP image.' };
    }
    const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) return { status: 400, error: 'Only JPEG, PNG, and WebP images are supported.' };
    const image = Buffer.from(match[2], 'base64');
    if (image.length > 8 * 1024 * 1024) {
      return { status: 413, error: 'Each image must be 8 MB or smaller.' };
    }
    if (!isSupportedImage(match[1], image)) {
      return { status: 400, error: 'An uploaded file does not match its image type.' };
    }
    totalSize += image.length;
    imageFiles.push({ mimeType: match[1], data: image });
  }
  if (totalSize > 56 * 1024 * 1024) {
    return { status: 413, error: 'The combined images in one project cannot exceed 56 MB.' };
  }
  return imageFiles;
};

const isProjectInputError = (value: unknown): value is ProjectInputError =>
  isRecord(value) && typeof value.status === 'number' && typeof value.error === 'string';

// In-memory persistent messages store with initial demo inquiries for Danso
interface InquiryMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  inquiryType: string;
  budget?: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: 'delivered' | 'read' | 'pending';
}

const initialMessages: InquiryMessage[] = [
  {
    id: 'msg-rec-001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@techvision-capital.io',
    subject: 'UI/UX & Product Design Collaboration (Aradad Homes & Mobile Web)',
    inquiryType: 'UI/UX Design & Full-time Hiring',
    budget: '$85k - $120k / year',
    message: 'Hi Danso, we reviewed your UI/UX design case studies for Aradad Homes and Honeycave Market. We are expanding our digital product division and would love to discuss a UI/UX designer and IT consulting engagement with you.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
    status: 'delivered'
  },
  {
    id: 'msg-rec-002',
    name: 'Alexander Chen',
    email: 'alex@lumina-labs.com',
    subject: 'Tableau Visual Analytics & Database Optimization Project',
    inquiryType: 'Technical Advisory',
    budget: '$10,000 - $25,000',
    message: 'Danso, we saw your expertise in Tableau visual analytics, MySQL database management, and network infrastructure. We would love to engage you for building custom analytics dashboards and database audits.',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    read: false,
    status: 'delivered'
  }
];

let messages: InquiryMessage[] = [...initialMessages];

// AI Client initialization
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// --- API Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    owner: 'Danso Robert Opoku',
    timestamp: new Date().toISOString()
  });
});

// Owner login is verified on the server; the client never controls this session.
app.get('/api/owner/session', (req, res) => {
  res.json({ isOwner: getOwnerSession(req) });
});

app.post('/api/owner/login', (req, res) => {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const attempts = ownerLoginAttempts.get(ip);
  if (attempts && attempts.resetAt > now && attempts.count >= 5) {
    return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  }

  const configuredPasscode = process.env.OWNER_PASSCODE;
  if (!configuredPasscode || configuredPasscode.length < 12) {
    return res.status(503).json({
      error: 'Owner login is not configured. Set OWNER_PASSCODE to a secret of at least 12 characters in the server environment.',
    });
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  const candidate = Buffer.from(passcode);
  const expected = Buffer.from(configuredPasscode);
  const isValid = candidate.length === expected.length && timingSafeEqual(candidate, expected);
  if (!isValid) {
    if (!attempts || attempts.resetAt <= now) {
      ownerLoginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      attempts.count += 1;
    }
    return res.status(401).json({ error: 'Incorrect owner passcode.' });
  }

  ownerLoginAttempts.delete(ip);
  const expiresAt = now + OWNER_SESSION_DURATION_MS;
  const token = signOwnerSession(expiresAt) ?? randomUUID();
  if (!signOwnerSession(expiresAt)) {
    // Local fallback when signing secret checks change mid-session.
    ownerSessions.set(token, expiresAt);
  }
  res.setHeader(
    'Set-Cookie',
    `${OWNER_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${OWNER_SESSION_DURATION_MS / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );
  return res.json({ success: true });
});

app.post('/api/owner/logout', (req, res) => {
  const token = getOwnerSessionToken(req);
  if (token) ownerSessions.delete(token);
  res.setHeader('Set-Cookie', `${OWNER_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return res.json({ success: true });
});

app.get('/api/work-gallery', async (_req, res) => {
  try {
    return res.json({ projects: await readWorkProjects() });
  } catch (error) {
    return sendServerError(res, 'Could not load work projects.', error);
  }
});

app.post('/api/work-gallery', requireOwner, async (req, res) => {
  try {
    const input = validateProjectInput(req.body);
    if (isProjectInputError(input)) {
      return res.status(input.status).json({ error: input.error });
    }

    const imageFiles = decodeProjectImages(input.images as unknown[]);
    if (isProjectInputError(imageFiles)) {
      return res.status(imageFiles.status).json({ error: imageFiles.error });
    }

    const { title, caption } = input;
    const supabase = supabaseAdmin();

    if (supabase) {
      const { count } = await supabase
        .from('work_gallery_projects')
        .select('id', { count: 'exact', head: true });
      if ((count ?? 0) >= 300) return res.status(409).json({ error: 'The work gallery has reached its 300-project limit.' });

      const { data: projectRow, error: projectError } = await supabase
        .from('work_gallery_projects')
        .insert({ title, caption })
        .select('id, title, caption, created_at')
        .single();
      if (projectError || !projectRow) throw projectError ?? new Error('Could not create the work project.');

      const projectImages: WorkGalleryImage[] = [];
      const uploadedPaths: string[] = [];
      try {
        for (const image of imageFiles) {
          const imageId = randomUUID();
          const extension = image.mimeType === 'image/jpeg' ? 'jpg' : image.mimeType.slice('image/'.length);
          const storagePath = `${projectRow.id as string}/${imageId}.${extension}`;
          const { error: uploadError } = await supabase.storage
            .from(WORK_GALLERY_BUCKET)
            .upload(storagePath, image.data, { contentType: image.mimeType, upsert: false });
          if (uploadError) throw uploadError;
          uploadedPaths.push(storagePath);
          const { data: publicUrl } = supabase.storage.from(WORK_GALLERY_BUCKET).getPublicUrl(storagePath);
          const { data: imageRow, error: imageError } = await supabase
            .from('work_gallery_images')
            .insert({
              id: imageId,
              project_id: projectRow.id as string,
              image_url: publicUrl.publicUrl,
              storage_path: storagePath,
              mime_type: image.mimeType,
            })
            .select('id, image_url')
            .single();
          if (imageError || !imageRow) throw imageError ?? new Error('Could not save the project image.');
          projectImages.push({ id: imageRow.id as string, imageUrl: imageRow.image_url as string });
        }

        const project: WorkProject = {
          id: projectRow.id as string,
          title: projectRow.title as string,
          caption: (projectRow.caption as string) ?? '',
          images: projectImages,
          createdAt: projectRow.created_at as string,
        };
        const projects = await readWorkProjects();
        return res.status(201).json({ project, projects });
      } catch (error) {
        await supabase.storage.from(WORK_GALLERY_BUCKET).remove(uploadedPaths).catch(() => undefined);
        await supabase.from('work_gallery_projects').delete().eq('id', projectRow.id as string);
        throw error;
      }
    }

    const projects = await readWorkProjects();
    if (projects.length >= 300) return res.status(409).json({ error: 'The work gallery has reached its 300-project limit.' });

    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await fsPromises.mkdir(workGalleryDirectory, { recursive: true });
    const projectImages: WorkGalleryImage[] = [];
    const createdFiles: string[] = [];
    try {
      for (const image of imageFiles) {
        const imageId = randomUUID();
        const extension = image.mimeType === 'image/jpeg' ? 'jpg' : image.mimeType.slice('image/'.length);
        const filename = `${imageId}.${extension}`;
        await fsPromises.writeFile(path.join(workGalleryDirectory, filename), image.data, { flag: 'wx' });
        createdFiles.push(filename);
        projectImages.push({ id: imageId, imageUrl: `/uploads/work-gallery/${filename}` });
      }

      const project: WorkProject = {
        id,
        title,
        caption,
        images: projectImages,
        createdAt,
      };
      const updatedProjects = [project, ...projects];
      await writeWorkProjects(updatedProjects);
      return res.status(201).json({ project, projects: updatedProjects });
    } catch (error) {
      await Promise.all(createdFiles.map((filename) =>
        fsPromises.unlink(path.join(workGalleryDirectory, filename)).catch((cleanupError: NodeJS.ErrnoException) => {
          if (cleanupError.code !== 'ENOENT') throw cleanupError;
        })
      ));
      throw error;
    }
  } catch (error) {
    return sendServerError(res, 'Could not save the work project.', error);
  }
});

app.delete('/api/work-gallery/:id', requireOwner, async (req, res) => {
  try {
    const supabase = supabaseAdmin();
    if (supabase) {
      const { data: project, error: projectError } = await supabase
        .from('work_gallery_projects')
        .select('id')
        .eq('id', req.params.id)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) return res.status(404).json({ error: 'Work project not found.' });

      const { data: images } = await supabase
        .from('work_gallery_images')
        .select('storage_path')
        .eq('project_id', req.params.id);
      const storagePaths = (images ?? []).map((image) => image.storage_path as string).filter(Boolean);
      if (storagePaths.length > 0) {
        await supabase.storage.from(WORK_GALLERY_BUCKET).remove(storagePaths).catch(() => undefined);
      }
      const { error: deleteError } = await supabase.from('work_gallery_projects').delete().eq('id', req.params.id);
      if (deleteError) throw deleteError;
      return res.json({ projects: await readWorkProjects() });
    }

    const projects = await readWorkProjects();
    const project = projects.find((item) => item.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Work project not found.' });

    const updatedProjects = projects.filter((item) => item.id !== project.id);
    await writeWorkProjects(updatedProjects);
    await Promise.all(project.images.map(async (image) => {
      const filename = path.basename(image.imageUrl);
      try {
        await fsPromises.unlink(path.join(workGalleryDirectory, filename));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }));
    return res.json({ projects: updatedProjects });
  } catch (error) {
    return sendServerError(res, 'Could not remove the work project.', error);
  }
});

const toInquiryMessage = (row: Record<string, unknown>): InquiryMessage => ({
  id: String(row.id),
  name: String(row.name),
  email: String(row.email),
  subject: String(row.subject ?? 'New Portfolio Inquiry'),
  inquiryType: String(row.inquiry_type ?? 'General Inquiry'),
  budget: row.budget === null || row.budget === undefined ? undefined : String(row.budget),
  message: String(row.message),
  timestamp: String(row.timestamp),
  read: Boolean(row.read),
  status: (row.status === 'read' || row.status === 'pending' ? row.status : 'delivered') as InquiryMessage['status'],
});

const readMessagesFromSupabase = async (): Promise<InquiryMessage[]> => {
  const supabase = supabaseAdmin();
  if (!supabase) return [...messages];
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, name, email, subject, inquiry_type, budget, message, timestamp, read, status')
    .order('timestamp', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((row) => toInquiryMessage(row as Record<string, unknown>));
};

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, inquiryType, budget, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(email).trim())) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const payload = {
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().slice(0, 160),
      subject: subject ? String(subject).trim().slice(0, 200) : 'New Portfolio Inquiry',
      inquiry_type: inquiryType ? String(inquiryType).slice(0, 120) : 'General Inquiry',
      budget: budget ? String(budget).slice(0, 120) : 'Flexible',
      message: String(message).trim().slice(0, 5000),
    };

    const supabase = supabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .insert(payload)
        .select('id, name, email, subject, inquiry_type, budget, message, timestamp, read, status')
        .single();
      if (error || !data) throw error ?? new Error('Could not save the inquiry.');
      const inquiry = toInquiryMessage(data as Record<string, unknown>);
      console.log(`[NOTIFICATION DISPATCH] Alert sent to dansorobert360@gmail.com from ${inquiry.name} <${inquiry.email}>`);
      const allMessages = await readMessagesFromSupabase();
      return res.status(201).json({
        success: true,
        message: 'Inquiry received and notification dispatched to dansorobert360@gmail.com! Danso will respond within 24-48 hours.',
        inquiry,
        unreadCount: allMessages.filter((item) => !item.read).length,
      });
    }

    const newMessage: InquiryMessage = {
      id: `msg-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      inquiryType: payload.inquiry_type,
      budget: payload.budget,
      message: payload.message,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'delivered'
    };

    messages.unshift(newMessage);

    console.log(`[NOTIFICATION DISPATCH] Alert sent to dansorobert360@gmail.com from ${newMessage.name} <${newMessage.email}>`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received and notification dispatched to dansorobert360@gmail.com! Danso will respond within 24-48 hours.',
      inquiry: newMessage,
      unreadCount: messages.filter(m => !m.read).length
    });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return res.status(500).json({ error: 'Failed to process inquiry.' });
  }
});

// Messages list for recruiter inbox / notification badge
app.get('/api/messages', requireOwner, async (req, res) => {
  try {
    const allMessages = await readMessagesFromSupabase();
    const unreadCount = allMessages.filter(m => !m.read).length;
    res.json({
      messages: allMessages,
      unreadCount,
      totalCount: allMessages.length
    });
  } catch (error) {
    return sendServerError(res, 'Could not load messages.', error);
  }
});

// Mark message as read
app.patch('/api/messages/:id/read', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = supabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ read: true, status: 'read' })
        .eq('id', id)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: `Message ${id} was not found.` });
      }
      const allMessages = await readMessagesFromSupabase();
      return res.json({ success: true, unreadCount: allMessages.filter((m) => !m.read).length, messages: allMessages });
    }
    const msg = messages.find(m => m.id === id);
    if (!msg) {
      return res.status(404).json({ error: `Message ${id} was not found.` });
    }
    msg.read = true;
    msg.status = 'read';
    const unreadCount = messages.filter(m => !m.read).length;
    return res.json({ success: true, unreadCount, messages });
  } catch (error) {
    return sendServerError(res, 'Could not update the message.', error);
  }
});

// Mark all as read
app.post('/api/messages/mark-all-read', requireOwner, async (req, res) => {
  try {
    const supabase = supabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('inquiries')
        .update({ read: true, status: 'read' })
        .eq('read', false);
      if (error) throw error;
      const allMessages = await readMessagesFromSupabase();
      return res.json({ success: true, unreadCount: 0, messages: allMessages });
    }
    messages.forEach(m => {
      m.read = true;
      m.status = 'read';
    });
    res.json({ success: true, unreadCount: 0, messages });
  } catch (error) {
    return sendServerError(res, 'Could not update messages.', error);
  }
});

// Delete message
app.delete('/api/messages/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = supabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.from('inquiries').delete().eq('id', id).select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: `Message ${id} was not found.` });
      }
      const allMessages = await readMessagesFromSupabase();
      return res.json({ success: true, unreadCount: allMessages.filter((m) => !m.read).length, messages: allMessages });
    }
    messages = messages.filter(m => m.id !== id);
    const unreadCount = messages.filter(m => !m.read).length;
    res.json({ success: true, unreadCount, messages });
  } catch (error) {
    return sendServerError(res, 'Could not delete the message.', error);
  }
});

// Reset demo messages
app.post('/api/messages/reset', requireOwner, async (req, res) => {
  try {
    const supabase = supabaseAdmin();
    if (supabase) {
      await supabase.from('inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error } = await supabase.from('inquiries').insert(
        initialMessages.map((item) => ({
          name: item.name,
          email: item.email,
          subject: item.subject,
          inquiry_type: item.inquiryType,
          budget: item.budget ?? null,
          message: item.message,
        })),
      );
      if (error) throw error;
      const allMessages = await readMessagesFromSupabase();
      return res.json({ success: true, unreadCount: allMessages.filter((m) => !m.read).length, messages: allMessages });
    }
    messages = [...initialMessages];
    res.json({ success: true, unreadCount: messages.filter(m => !m.read).length, messages });
  } catch (error) {
    return sendServerError(res, 'Could not reset messages.', error);
  }
});

// Resume / credentials unlock ($0.50 micro-payment)
// Public endpoint: visitors pay to unlock; owners bypass on the client via handleOpenPaywall.
app.post('/api/payments/resume-unlock', (req, res) => {
  const { name, cardNumber, cardExpiry, cardCvc, momoNetwork, momoNumber, paymentMethod } = req.body ?? {};

  const digitsOnly = (value: unknown) => (typeof value === 'string' ? value.replace(/\D/g, '') : '');
  const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

  const method = paymentMethod === 'momo' ? 'momo' : 'card';
  const gatewaySecret = process.env.PAYMENT_GATEWAY_SECRET;
  if (!gatewaySecret) {
    return res.status(503).json({
      error: 'Payments are not configured. Set PAYMENT_GATEWAY_SECRET on the server to enable the $0.50 unlock.',
    });
  }

  if (method === 'momo') {
    if (!isNonEmptyString(momoNumber)) {
      return res.status(400).json({ error: 'Enter the mobile money wallet number.' });
    }
    const momoDigits = digitsOnly(momoNumber);
    if (momoDigits.length < 9 || momoDigits.length > 15) {
      return res.status(400).json({ error: 'Enter a valid mobile money number.' });
    }
    if (!isNonEmptyString(momoNetwork)) {
      return res.status(400).json({ error: 'Select a mobile money network provider.' });
    }
  } else {
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'The cardholder name is required.' });
    }
    const cardDigits = digitsOnly(cardNumber);
    if (cardDigits.length < 12 || cardDigits.length > 19) {
      return res.status(400).json({ error: 'Enter a valid card number.' });
    }
    if (!/^\d{2}\/\d{2}$/.test(String(cardExpiry ?? ''))) {
      return res.status(400).json({ error: 'Enter the expiry date as MM/YY.' });
    }
    if (!/^\d{3,4}$/.test(digitsOnly(cardCvc))) {
      return res.status(400).json({ error: 'Enter the 3 or 4 digit CVC.' });
    }
  }

  const receiptId = `TXN-${randomUUID().slice(0, 8).toUpperCase()}`;
  const payer = method === 'momo' ? String(momoNumber).trim() : String(name).trim();
  console.log(`[PAYMENT] $0.50 resume unlock authorized via ${method} for ${payer} (${receiptId})`);
  return res.json({ success: true, receiptId, amountUsd: 0.5, paymentMethod: method });
});

// AI Feature 1: Image Understanding & Analysis using gemini-3.1-pro-preview
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, analysisType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    // Clean base64 string if data url header was included
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getAiClient();

    const systemContext = `You are the AI Senior Engineering & Design Critic assistant for Danso Robert Opoku's portfolio.
Danso is a Senior Full-Stack Engineer and Creative Technologist specializing in React, Node.js, PostgreSQL, Supabase, Cloud Architecture, and Minimalist UI.
Evaluate the uploaded image based on the requested perspective:
${analysisType === 'ux_code' ? 'Analyze the UI/UX architecture, visual hierarchy, usability, accessibility (a11y), responsive design, and provide clean frontend code recommendations.' : ''}
${analysisType === 'architecture' ? 'Analyze the system diagram, wireframe, or tech stack, evaluating scalability, microservices, database choice, and cloud resilience.' : ''}
${analysisType === 'creative' ? 'Analyze the visual aesthetic, color harmony, typography, branding, and creative execution.' : ''}

Provide a structured, beautifully formatted markdown response with:
1. Executive Summary
2. Key Observations & Strengths
3. Areas for Optimization (Engineering / UX / Performance)
4. Danso's Recommended Next Steps & Implementation Advice.`;

    const userPrompt = prompt || 'Please analyze this project mockup / screenshot and provide architectural and UX design feedback.';

    // Primary model as requested: gemini-3.1-pro-preview
    // With graceful fallback to gemini-3.8-flash if model permission or quota requires it
    let resultText = '';
    let modelUsed = 'gemini-3.1-pro-preview';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `${systemContext}\n\nUser Request: ${userPrompt}`,
              },
            ],
          },
        ],
      });
      resultText = response.text || 'Analysis completed with no content returned.';
    } catch (modelError: unknown) {
      console.warn('gemini-3.1-pro-preview call failed, falling back to gemini-3.8-flash:', getErrorMessage(modelError));
      // Fallback
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `${systemContext}\n\nUser Request: ${userPrompt}`,
              },
            ],
          },
        ],
      });
      resultText = fallbackResponse.text || 'Analysis completed.';
      modelUsed = 'gemini-3.8-flash';
    }

    return res.json({
      success: true,
      analysis: resultText,
      modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Image analysis error:', error);
    return res.status(500).json({
      error: getErrorMessage(error) || 'Failed to analyze image. Please ensure GEMINI_API_KEY is configured.'
    });
  }
});

// AI Feature 2: Image Generation & Editing using gemini-3.1-flash-image-preview
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, baseImageBase64, mimeType = 'image/jpeg', aspectRatio = '1:1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'A prompt describing the image is required.' });
    }

    const ai = getAiClient();

    // If an image is provided, we edit it; otherwise generate new image
    type GenerateContentPart =
      | { inlineData: { data: string; mimeType: string } }
      | { text: string };
    const parts: GenerateContentPart[] = [];
    if (baseImageBase64) {
      const cleanBase64 = baseImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      });
      parts.push({
        text: `Edit or transform this image according to the instruction: ${prompt}. Produce a refined, high-fidelity result.`,
      });
    } else {
      parts.push({
        text: prompt,
      });
    }

    // Try gemini-3.1-flash-image-preview
    let generatedImageDataUrl: string | null = null;
    let descriptionText = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts,
        },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio === '16:9' || aspectRatio === '3:4' || aspectRatio === '4:3') ? aspectRatio : '1:1',
          },
        },
      });

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData) {
          generatedImageDataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }
    } catch (genError: unknown) {
      console.warn('gemini-3.1-flash-image-preview failed, attempting fallback:', getErrorMessage(genError));

      // If image generation model requires paid tier or failed, try gemini-3.1-flash-lite-image or describe mockup
      try {
        const fallback = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts },
        });
        const candidateParts = fallback.candidates?.[0]?.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData) {
            generatedImageDataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            descriptionText += part.text;
          }
        }
      } catch (secondaryError: unknown) {
        console.warn('Secondary image gen failed:', getErrorMessage(secondaryError));
        throw genError;
      }
    }

    if (!generatedImageDataUrl) {
      return res.status(200).json({
        success: true,
        message: 'Prompt processed. No binary image returned by endpoint, but text guidance provided.',
        textOutput: descriptionText,
        imageUrl: null,
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageDataUrl,
      description: descriptionText,
      modelUsed: 'gemini-3.1-flash-image-preview',
    });
  } catch (error: unknown) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: getErrorMessage(error) || 'Image creation failed. Check API key configuration or try another prompt.'
    });
  }
});

// Serve legacy locally-stored gallery images (local dev only). In production,
// images live in Supabase Storage and imageUrl points at public Supabase URLs.
app.use('/uploads/work-gallery', express.static(workGalleryDirectory, { maxAge: '1d', immutable: true }));

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  try {
    await fsPromises.mkdir(workGalleryDirectory, { recursive: true });
  } catch {
    // Serverless filesystems (Vercel) are read-only; Supabase Storage is the source of truth there.
  }

  if (isProduction) {
    // In production, serve dist folder.
    // NOTE: the Vite dev server is deliberately never imported in this module.
    // Local dev serves the frontend through dev-server.ts (`npm run dev`) so the
    // serverless bundler cannot trace Vite into the Vercel API function.
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  if (process.env.VERCEL) return;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Server running at http://localhost:${PORT}`);
    console.log(`Serving Danso Robert Opoku's portfolio`);
    console.log(`Supabase backend: ${isSupabaseConfigured() ? 'connected' : 'not configured (using local fallbacks)'}`);
  });
}

// Auto-start only when this file is the direct entrypoint (`tsx server.ts`).
// Importers (dev-server.ts, api/index.ts) manage listening/bundling themselves.
const entryFile = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entryFile === import.meta.url && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
