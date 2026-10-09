import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { WorkProject } from '../types';

interface WorkGallerySectionProps {
  isOwner: boolean;
}

const MAX_PROJECT_IMAGES = 7;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export const WorkGallerySection: React.FC<WorkGallerySectionProps> = ({ isOwner }) => {
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/work-gallery');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not load the work gallery.');
      }
      setProjects(data.projects);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the work gallery.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Choose at least one image for this project.');
      return;
    }
    if (selectedFiles.length > MAX_PROJECT_IMAGES) {
      setError(`Choose no more than ${MAX_PROJECT_IMAGES} images for each project.`);
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setError('Each image must be 8 MB or smaller.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const images = await Promise.all(selectedFiles.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error(`The image "${file.name}" could not be read.`));
        };
        reader.onerror = () => reject(new Error(`The image "${file.name}" could not be read.`));
        reader.readAsDataURL(file);
      })));

      const response = await fetch('/api/work-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, caption, images }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The project images could not be uploaded.');
      }
      setProjects(data.projects);
      setSelectedFiles([]);
      setTitle('');
      setCaption('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The project images could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (project: WorkProject) => {
    if (!window.confirm(`Remove "${project.title}" and all its images from the public gallery?`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/work-gallery/${encodeURIComponent(project.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The photo could not be removed.');
      }
      setProjects(data.projects);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'The photo could not be removed.');
    }
  };

  return (
    <section id="gallery" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
            <ImagePlus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Visual Portfolio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Work Projects
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2">
            A closer look at selected design, development, and IT projects.
          </p>
        </div>

        {isOwner && (
          <form onSubmit={handleUpload} className="mb-10 grid gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Add a work project</h3>
              <p className="mt-1 text-xs text-zinc-500">Add up to {MAX_PROJECT_IMAGES} JPEG, PNG, or WebP images (8 MB each) to one project. Uploaded images are public.</p>
            </div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Project images (up to {MAX_PROJECT_IMAGES})
              <input
                ref={photoInputRef}
                id="work-gallery-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  setSelectedFiles(files);
                  setError(files.length > MAX_PROJECT_IMAGES ? `Choose no more than ${MAX_PROJECT_IMAGES} images for each project.` : null);
                }}
                className="mt-1.5 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-semibold dark:file:bg-zinc-800"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                required
                placeholder="Project or work title"
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 md:col-span-2">
              Caption (optional)
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={300}
                rows={2}
                placeholder="A short description of this work"
                className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isUploading || selectedFiles.length === 0 || selectedFiles.length > MAX_PROJECT_IMAGES}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? 'Uploading…' : 'Add project to gallery'}
              </button>
              {selectedFiles.length > 0 && (
                <span className={`text-xs ${selectedFiles.length > MAX_PROJECT_IMAGES ? 'text-rose-500' : 'text-zinc-500'}`}>
                  {selectedFiles.length} of {MAX_PROJECT_IMAGES} images selected
                </span>
              )}
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading work projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No work projects have been added yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-800">
                  {project.images.map((image, index) => (
                    <a key={image.id} href={image.imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={`${project.title} — image ${index + 1}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </a>
                  ))}
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">{project.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{project.images.length} {project.images.length === 1 ? 'image' : 'images'}</p>
                    {project.caption && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{project.caption}</p>}
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(project)}
                      aria-label={`Remove ${project.title}`}
                      title="Remove project"
                      className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
