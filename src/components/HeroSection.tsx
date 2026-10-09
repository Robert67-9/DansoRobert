import React, { useState } from 'react';
import { 
  ArrowDown, 
  Download, 
  Send, 
  Sparkles, 
  Database, 
  Layers, 
  Globe, 
  Maximize2
} from 'lucide-react';
import { ProfileData } from '../types';

interface HeroSectionProps {
  profile: ProfileData;
  onOpenContact: () => void;
  isOwner?: boolean;
  onOpenPaywall?: () => void;
  hasPaidResume?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  onOpenContact,
  isOwner = false,
  onOpenPaywall,
  hasPaidResume = false,
}) => {
  // Avatar display size mode: 'large' (default big) or 'spotlight' (ultra big)
  const [avatarSizeMode, setAvatarSizeMode] = useState<'large' | 'spotlight'>('large');

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!isOwner && !hasPaidResume && onOpenPaywall) {
      e.preventDefault();
      onOpenPaywall();
      return;
    }
    const el = document.getElementById('resume');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Prominent Big Profile Picture Container */}
          <div className="relative mb-6 group flex flex-col items-center">
            
            <div 
              className={`relative rounded-3xl p-1.5 sm:p-2 bg-gradient-to-tr from-zinc-300 via-zinc-200 to-zinc-400 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-900 shadow-2xl transition-all duration-300 ${
                avatarSizeMode === 'spotlight'
                  ? 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96'
                  : 'w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72'
              }`}
            >
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-zinc-950 ring-2 ring-white/90 dark:ring-zinc-900 shadow-inner">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Size toggle pill */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarSizeMode(prev => prev === 'large' ? 'spotlight' : 'large');
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-md opacity-80 hover:opacity-100 transition-all shadow-md"
                title={avatarSizeMode === 'spotlight' ? 'Switch to Large view' : 'Switch to Ultra Spotlight view'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Availability status badge */}
            <div className="mt-4 whitespace-nowrap bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Open to Opportunities
              </span>
            </div>
          </div>

          {/* Name & Role Badge (No Site URL) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300 mb-5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{profile.name}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>UI/UX Designer</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>IT Consultant</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
              Drone Pilot (RPAS / GCAA)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.1] mb-6">
            Translating Client & User Needs Into Clean, Usable Digital Experiences.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed mb-8">
            {profile.bio}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume (PDF)</span>
              {!isOwner && !hasPaidResume ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white">
                  $0.50
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Unlocked
                </span>
              )}
            </button>

            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-xs active:scale-95"
            >
              <Send className="w-4 h-4 text-emerald-500" />
              Direct Inquiry Form
            </button>

            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Explore Projects
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xs">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight font-mono">
                UI/UX & Web
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Figma, Adobe XD & Code
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight font-mono">
                Drone Pilot
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                GCAA RPAS Safety Certified
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight font-mono">
                Tableau & BI
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Visual Analytics & Data
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight font-mono">
                Flagship Sites
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Aradad, Honeycave & Maxi
              </span>
            </div>
          </div>

          {/* Core competencies badges (No Site URL) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Figma & UI/UX Design
            </span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" /> GCAA Certified Drone Pilot (RPAS)
            </span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500" /> Tableau & Relational Databases
            </span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" /> Web & Digital Marketing
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
