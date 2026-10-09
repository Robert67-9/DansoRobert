import React, { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Code,
  Terminal,
  Cpu
} from 'lucide-react';
import { ProfileData, WorkExperience, Education, SkillGroup } from '../types';
import { skillGroups, certifications } from '../data/portfolioData';

interface ExperienceSectionProps {
  profile: ProfileData;
  experiences: WorkExperience[];
  education: Education[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  profile,
  experiences,
  education,
}) => {
  const [activeTab, setActiveTab] = useState<'experience' | 'skills' | 'history'>('experience');

  return (
    <section id="experience" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span>Professional Career & Background</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Work Experience & Background History
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2">
            A track record of engineering scalable cloud backends, distributed database pipelines, and high-performance frontend interfaces.
          </p>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'experience'
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Work History Timeline
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Background & Education
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'skills'
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Technical Competencies
            </button>
          </div>
        </div>

        {/* Tab 1: Work Experience Timeline */}
        {activeTab === 'experience' && (
          <div className="relative pl-6 sm:pl-8 border-l border-zinc-200 dark:border-zinc-800 space-y-12">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 group-hover:scale-125 transition-transform"></div>

                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-zinc-50">
                        {exp.role}
                      </h3>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {exp.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.period}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Bulleted Key Achievements */}
                  <div className="space-y-2 mb-5">
                    {exp.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    {exp.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Background History & Education */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Story & Philosophy */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
                  The Journey of Danso Robert Opoku
                </h3>
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-zinc-600 dark:text-zinc-300 space-y-4 leading-relaxed whitespace-pre-line">
                  {profile.backgroundStory}
                </div>
              </div>

              {/* Design & Engineering Philosophy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-500" /> Human-Centered UI/UX Design
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Translating client visions and complex workflows into clean, accessible, and high-converting digital interfaces using Figma, Adobe XD, and modern responsive web principles.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-500" /> Tableau & System Reliability
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Delivering actionable business intelligence with Tableau interactive dashboards, structured database administration, and resilient network infrastructure.
                  </p>
                </div>
              </div>
            </div>

            {/* Education & Credentials */}
            <div className="space-y-6">
              {/* Education Box */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                    Academic Background
                  </h3>
                </div>

                {education.map((edu) => (
                  <div key={edu.id} className="space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {edu.institution}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {edu.period} • {edu.location}
                      </p>
                    </div>

                    {edu.honors && (
                      <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        🏆 {edu.honors}
                      </div>
                    )}

                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 mt-2">
                      {edu.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Certifications Box */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400">
                  <Award className="w-5 h-5" />
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                    Certifications & Licensure
                  </h3>
                </div>

                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                      <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {cert.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1">
                        <span>{cert.issuer}</span>
                        <span>{cert.year}</span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {cert.id}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership & Languages Box */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-3">
                  Leadership & Languages
                </h3>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <p>• <strong>SRC Electoral Commission:</strong> Public Relations Officer</p>
                  <p>• <strong>Campus Leadership:</strong> Chaplaincy Head / Prefect</p>
                  <p>• <strong>Honors:</strong> Best Student Graphic Designer & Participant</p>
                  <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <span className="font-bold font-mono text-zinc-500">Languages:</span>
                    <span className="font-medium">English • Twi • Ga</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Technical Skills Matrix */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGroups.map((group) => (
              <div
                key={group.category}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs"
              >
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>{group.category}</span>
                  <Code className="w-4 h-4 text-zinc-400" />
                </h3>

                <div className="space-y-3.5">
                  {group.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-medium ${skill.highlight ? 'text-zinc-950 dark:text-zinc-50 font-semibold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {skill.name}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px]">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            skill.highlight
                              ? 'bg-emerald-500 dark:bg-emerald-400'
                              : 'bg-zinc-400 dark:bg-zinc-600'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
