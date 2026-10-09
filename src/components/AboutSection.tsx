import React from 'react';
import { MapPin, UserRound } from 'lucide-react';
import { ProfileData } from '../types';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => (
  <section id="about" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
            <UserRound className="w-3.5 h-3.5 text-emerald-500" />
            <span>About Me</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Design-minded. Technically grounded.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {profile.bio}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>{profile.location}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            My background
          </h3>
          <p className="whitespace-pre-line text-sm sm:text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {profile.backgroundStory}
          </p>
        </div>
      </div>
    </div>
  </section>
);
