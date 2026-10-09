import React from 'react';
import { 
  X, 
  ExternalLink, 
  Github, 
  Database, 
  Layers, 
  CheckCircle, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Actions */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-zinc-950">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors backdrop-blur-xs focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title on Image */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white font-mono">
                {project.category}
              </span>
              <span className="text-zinc-400 text-xs font-mono">{project.year}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-18rem)] overflow-y-auto">
          {/* Tagline */}
          <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 font-medium">
            {project.tagline}
          </p>

          {/* Tech Stack Pills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 font-mono">
              Technologies & Infrastructure
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            {project.metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <span className="block text-sm sm:text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metric}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Benchmark
                </span>
              </div>
            ))}
          </div>

          {/* Case Study Sections */}
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Executive Overview
              </h4>
              <p>{project.fullCaseStudy.overview}</p>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" /> Engineering Challenge & Scale
              </h4>
              <p>{project.fullCaseStudy.challenge}</p>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" /> System Architecture & Execution
              </h4>
              <p>{project.fullCaseStudy.architecture}</p>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-500" /> PostgreSQL & Supabase Database Design
              </h4>
              <p>{project.fullCaseStudy.databaseDesign}</p>
            </div>

            {/* Results */}
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Measurable Impact & Achievements:
              </h4>
              <ul className="space-y-1.5">
                {project.fullCaseStudy.keyResults.map((result, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <span>Live Platform</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
