import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  FileText, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  Globe, 
  MapPin,
  Eye
} from 'lucide-react';
import { ProfileData, WorkExperience, Education } from '../types';
import { skillGroups, certifications } from '../data/portfolioData';

interface ResumeSectionProps {
  profile: ProfileData;
  experiences: WorkExperience[];
  education: Education[];
  isOwner?: boolean;
  onOpenPaywall?: () => void;
  hasPaidResume?: boolean;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({
  profile,
  experiences,
  education,
  isOwner = false,
  onOpenPaywall,
  hasPaidResume = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Trigger print dialog for high-res PDF generation
  const handlePrintPdf = () => {
    if (!isOwner && !hasPaidResume && onOpenPaywall) {
      onOpenPaywall();
      return;
    }
    window.print();
  };

  // Generate downloadable standalone CV document
  const handleDownloadDoc = () => {
    if (!isOwner && !hasPaidResume && onOpenPaywall) {
      onOpenPaywall();
      return;
    }
    const resumeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - Danso Robert Opoku</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { margin-bottom: 4px; font-size: 28px; }
    h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.05em; }
    .contact { font-size: 13px; color: #444; margin-bottom: 20px; }
    .role-header { display: flex; justify-content: space-between; font-weight: bold; margin-top: 12px; }
    .company { color: #0284c7; }
    .period { color: #666; font-size: 12px; }
    ul { margin: 6px 0 16px 20px; padding: 0; }
    li { font-size: 13px; margin-bottom: 4px; }
    .skills-group { margin-bottom: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${profile.name}</h1>
  <div class="contact">
    ${profile.title} | ${profile.email} | ${profile.phone || '+233 591 784 205'} | ${profile.location} | GitHub: github.com/robert67-9
  </div>

  <h2>Professional Summary</h2>
  <p style="font-size: 13px;">${profile.bio}</p>

  <h2>Technical Competencies</h2>
  ${skillGroups.map(g => `
    <div class="skills-group">
      <strong>${g.category}:</strong> ${g.skills.map(s => s.name).join(', ')}
    </div>
  `).join('')}

  <h2>Professional Experience</h2>
  ${experiences.map(e => `
    <div class="role-header">
      <span>${e.role} — <span class="company">${e.company}</span></span>
      <span class="period">${e.period} (${e.location})</span>
    </div>
    <p style="font-size: 12px; margin: 2px 0 6px; color: #555;">${e.description}</p>
    <ul>
      ${e.achievements.map(a => `<li>${a}</li>`).join('')}
    </ul>
  `).join('')}

  <h2>Education</h2>
  ${education.map(ed => `
    <div class="role-header">
      <span>${ed.degree} — ${ed.institution}</span>
      <span class="period">${ed.period}</span>
    </div>
    <p style="font-size: 12px; color: #16a34a; font-weight: bold;">${ed.honors || ''}</p>
  `).join('')}

  <h2>Certifications</h2>
  <ul>
    ${certifications.map(c => `<li><strong>${c.title}</strong> — ${c.issuer} (${c.year})</li>`).join('')}
  </ul>
</body>
</html>
    `;

    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Danso_Robert_Opoku.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const textResume = `
Danso Robert Opoku
UI/UX Designer | Web & Digital Product Design | IT Consultant
Phone: +233 591 784 205
Email: dansorobert360@gmail.com
Location: Lakeside Estate, Adenta, Accra, Ghana
LinkedIn: https://linkedin.com/in/rober-opoku-danso
GitHub: https://github.com/robert67-9

PROFESSIONAL SUMMARY
${profile.bio}

CORE TECHNICAL & DESIGN SKILLS
- Design Tools: Figma, Adobe XD, Photoshop, Canva, Visual Arts
- Data Analytics & BI: Tableau, Data Modeling, KPI Dashboards, Interactive Reporting
- Web Development: HTML5, CSS3, JavaScript, Python/Django, Responsive Design
- Databases & Systems: MySQL, PostgreSQL, Role-Based Access Control, Database Administration
- IT Infrastructure & Hardware: Network Engineering, Smart Office/IoT, CCTV, QuickBooks POS

FEATURED PROJECTS
- Aradad Homes: Luxury Real Estate & Property Discovery Platform (UI/UX & Web)
- Honeycave Market: Digital Marketplace & E-commerce Platform with Loyalty Rewards
- Maxi Auto Brokers USA: Automotive Brokerage Web Portal & Digital Marketing Creative
- Tableau Visual Analytics: Interactive Business Intelligence Dashboards
- Washing Bay Management System: Python/Django & MySQL web operations platform (KTU Capstone)

EXPERIENCE
${experiences.map(e => `
${e.role} | ${e.company} (${e.period})
${e.achievements.map(a => `- ${a}`).join('\n')}
`).join('\n')}

EDUCATION
${education.map(ed => `${ed.degree} - ${ed.institution} (${ed.honors || ''})`).join('\n')}

CERTIFICATIONS
${certifications.map(c => `- ${c.title} (${c.issuer}, ${c.year})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="resume" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 no-print">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Curriculum Vitae</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Curriculum Vitae & Resume
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
              Accessible for recruiters, engineering managers, and technical leads looking for senior talent.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95"
              title={isOwner || hasPaidResume ? "Download official PDF resume (Unlocked)" : "Download official PDF resume ($0.50 USD)"}
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Resume</span>
              {!isOwner && !hasPaidResume ? (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500 text-white">
                  $0.50
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Unlocked
                </span>
              )}
            </button>

            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Print document"
            >
              <Printer className="w-4 h-4 text-zinc-500" />
              Print
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy plain-text resume"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Download standalone HTML resume file"
            >
              HTML Doc
            </button>
          </div>
        </div>

        {/* Printable Formatted CV Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm font-sans transition-all text-zinc-900 dark:text-zinc-100">
          
          {/* Resume Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-zinc-300 dark:ring-zinc-700 shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {profile.name}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {profile.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg">
                  {profile.tagline}
                </p>
              </div>
            </div>

            {/* Resume Contact Block */}
            <div className="text-xs font-mono space-y-1.5 text-zinc-600 dark:text-zinc-400 shrink-0 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <a href={`mailto:${profile.email}`} className="hover:underline">
                  {profile.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <a href="https://github.com/robert67-9" target="_blank" rel="noreferrer" className="hover:underline">
                  github.com/robert67-9
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.location}</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                ✓ Available for UI/UX Design & IT Consulting
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 font-mono">
              Professional Summary
            </h3>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Core Technical Matrix */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
              Technical Competencies & Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {skillGroups.map((group) => (
                <div key={group.category} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
                    {group.category}
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono text-[11px]">
                    {group.skills.map(s => s.name).join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience in Resume */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 font-mono">
              Work Experience
            </h3>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
                      {exp.role} <span className="text-zinc-400 font-normal">at</span> <span className="text-emerald-600 dark:text-emerald-400">{exp.company}</span>
                    </h4>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      {exp.period} • {exp.location}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    {exp.description}
                  </p>
                  <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {exp.achievements.map((ach, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs space-y-1">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {edu.degree}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                    {edu.institution}
                  </p>
                  <p className="font-mono text-zinc-500 text-[11px]">
                    {edu.period} • {edu.honors}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                  Certifications & Licensure
                </h3>
                <a
                  href="#certificates"
                  className="text-[11px] font-mono text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2 text-xs">
                {certifications.map((c, i) => (
                  <div key={i}>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {c.title}
                    </p>
                    <p className="text-zinc-500 font-mono text-[11px]">
                      {c.issuer} ({c.year})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Footer Note */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
            <span>Official digital curriculum vitae for Danso Robert Opoku</span>
            <span>Contact: dansorobert360@gmail.com • +233 591 784 205</span>
          </div>

        </div>

      </div>
    </section>
  );
};
