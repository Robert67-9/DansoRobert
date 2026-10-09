import React from 'react';
import { 
  ArrowUp, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Database, 
  Layers,
  Heart,
  Lock
} from 'lucide-react';
import { ProfileData } from '../types';

interface FooterProps {
  profile: ProfileData;
  onOpenCookieSettings?: () => void;
  onOpenSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onOpenCookieSettings, onOpenSettings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 md:py-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-300 dark:ring-zinc-700"
              />
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {profile.name}
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  UI/UX Designer & IT Consultant • Accra, Ghana
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              UI/UX-focused designer and IT professional delivering clean, usable digital experiences, responsive websites, Tableau analytics, and network infrastructure.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={profile.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Twitter/X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Email Direct"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <li>
                <a href="#projects" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Creative Projects & Gallery
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Work Photo Gallery
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Career Experience & History
                </a>
              </li>
              <li>
                <a href="#resume" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Download PDF Resume / CV
                </a>
              </li>
              <li>
                <a href="#ai-studio" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Gemini Vision & Creative Studio
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
                  Direct Inquiries Form
                </a>
              </li>
              {onOpenCookieSettings && (
                <li>
                  <button
                    onClick={onOpenCookieSettings}
                    className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors text-left"
                  >
                    Cookie Preferences
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Tech Spec */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
              Infrastructure
            </h4>
            <div className="space-y-2 text-xs text-zinc-500">
              <p className="flex items-center gap-1.5 font-mono text-[11px]">
                <Database className="w-3.5 h-3.5 text-blue-500" /> PostgreSQL & Supabase
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[11px]">
                <Layers className="w-3.5 h-3.5 text-emerald-500" /> Vercel Edge Hosting
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[11px]">
                <Globe className="w-3.5 h-3.5 text-purple-500" /> UI/UX, Web & IT Infrastructure
              </p>
              <p className="pt-2 text-[11px] text-zinc-400">
                Optimized for ultra-low latency & zero client-side layout shifts.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Back to Top */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved. Powered by {profile.name}.
          </p>

          <div className="flex items-center gap-4">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Owner login"
                title="Owner login"
              >
                <Lock className="w-3 h-3" />
                <span>Owner access</span>
              </button>
            )}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
