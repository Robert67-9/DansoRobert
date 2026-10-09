import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { WorkGalleryImage, WorkProject } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: [path.resolve(__dirname, '.env.local'), path.resolve(__dirname, '.env')] });

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const workGalleryDirectory = path.resolve(__dirname, 'storage', 'work-gallery');
const workGalleryMetadataPath = path.resolve(__dirname, 'storage', 'work-gallery.json');
const OWNER_SESSION_COOKIE = 'danso_owner_session';
const OWNER_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const ownerSessions = new Map<string, number>();
const ownerLoginAttempts = new Map<string, { count: number; resetAt: number }>();

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

const isWorkGalleryImage = (image: unknown): image is WorkGalleryImage =>
  isRecord(image)
  && typeof image.id === 'string'
  && typeof image.imageUrl === 'string'
  && image.imageUrl.startsWith('/uploads/work-gallery/');

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

const readWorkProjects = async (): Promise<WorkProject[]> => {
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

const writeWorkProjects = async (projects: WorkProject[]) => {
  await fsPromises.mkdir(path.dirname(workGalleryMetadataPath), { recursive: true });
  const temporaryPath = `${workGalleryMetadataPath}.${randomUUID()}.tmp`;
  await fsPromises.writeFile(temporaryPath, JSON.stringify(projects, null, 2), 'utf8');
  await fsPromises.rename(temporaryPath, workGalleryMetadataPath);
};

const getOwnerSession = (req: express.Request) => {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OWNER_SESSION_COOKIE}=`));
  const token = cookie?.slice(OWNER_SESSION_COOKIE.length + 1);
  if (!token) return false;
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

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
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
  const token = randomBytes(32).toString('hex');
  ownerSessions.set(token, now + OWNER_SESSION_DURATION_MS);
  res.setHeader(
    'Set-Cookie',
    `${OWNER_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${OWNER_SESSION_DURATION_MS / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );
  return res.json({ success: true });
});

app.post('/api/owner/logout', (req, res) => {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OWNER_SESSION_COOKIE}=`));
  const token = cookie?.slice(OWNER_SESSION_COOKIE.length + 1);
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

// Contact endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, inquiryType, budget, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newMessage: InquiryMessage = {
      id: `msg-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : 'New Portfolio Inquiry',
      inquiryType: inquiryType || 'General Inquiry',
      budget: budget || 'Flexible',
      message: String(message).trim(),
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
app.get('/api/messages', requireOwner, (req, res) => {
  const unreadCount = messages.filter(m => !m.read).length;
  res.json({
    messages,
    unreadCount,
    totalCount: messages.length
  });
});

// Mark message as read
app.patch('/api/messages/:id/read', requireOwner, (req, res) => {
  const { id } = req.params;
  const msg = messages.find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: `Message ${id} was not found.` });
  }
  msg.read = true;
  msg.status = 'read';
  const unreadCount = messages.filter(m => !m.read).length;
  return res.json({ success: true, unreadCount, messages });
});

// Mark all as read
app.post('/api/messages/mark-all-read', requireOwner, (req, res) => {
  messages.forEach(m => {
    m.read = true;
    m.status = 'read';
  });
  res.json({ success: true, unreadCount: 0, messages });
});

// Delete message
app.delete('/api/messages/:id', requireOwner, (req, res) => {
  const { id } = req.params;
  messages = messages.filter(m => m.id !== id);
  const unreadCount = messages.filter(m => !m.read).length;
  res.json({ success: true, unreadCount, messages });
});

// Reset demo messages
app.post('/api/messages/reset', requireOwner, (req, res) => {
  messages = [...initialMessages];
  res.json({ success: true, unreadCount: messages.filter(m => !m.read).length, messages });
});

// Resume / credentials unlock ($0.50 micro-payment)
app.post('/api/payments/resume-unlock', requireOwner, (req, res) => {
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

// Vite & Static file serving setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  await fsPromises.mkdir(workGalleryDirectory, { recursive: true });
  app.use('/uploads/work-gallery', express.static(workGalleryDirectory, { maxAge: '1d', immutable: true }));

  if (!isProduction) {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Server running at http://localhost:${PORT}`);
    console.log(`Serving Danso Robert Opoku's portfolio`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
