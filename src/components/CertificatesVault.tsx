import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ExternalLink, 
  CheckCircle2, 
  Download, 
  Printer, 
  X, 
  Eye, 
  FileText, 
  Sparkles, 
  Check, 
  Plane,
  QrCode,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import { detailedCertificates, DetailedCertificate } from '../data/portfolioData';

interface CertificatesVaultProps {
  isOwner?: boolean;
  hasUnlocked?: boolean;
  onOpenPaywall?: () => void;
}

export const CertificatesVault: React.FC<CertificatesVaultProps> = ({
  isOwner = false,
  hasUnlocked = false,
  onOpenPaywall,
}) => {
  const [selectedCert, setSelectedCert] = useState<DetailedCertificate | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Aviation & RPAS', 'Google', 'Government & University', 'Database & Systems', 'Design & Honors'];

  const filteredCerts = detailedCertificates.filter(c => {
    if (activeCategory === 'All') return true;
    return c.category === activeCategory;
  });

  const handleCardClick = (cert: DetailedCertificate) => {
    if (!isOwner && !hasUnlocked && onOpenPaywall) {
      onOpenPaywall();
      return;
    }
    setSelectedCert(cert);
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAccessUnlocked = isOwner || hasUnlocked;

  return (
    <section id="certificates" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
              <Award className="w-3.5 h-3.5 text-sky-500" />
              <span>Accreditation & Licenses</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Verified Credentials & Certifications Vault
            </h2>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
              Official professional certifications, government diplomas, and aviation drone pilot licenses certified by the Ghana Civil Aviation Authority (GCAA) and Google.
            </p>
          </div>

          {/* Paywall Gate Status Pill & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {!isAccessUnlocked ? (
              <button
                onClick={onOpenPaywall}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md group active:scale-95"
              >
                <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Unlock All Certificates</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white">
                  $0.50 USD
                </span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Access Unlocked</span>
              </div>
            )}
          </div>
        </div>

        {/* Access Notice Banner */}
        {!isAccessUnlocked ? (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Protected Credential Documents ($0.50 Micro-Fee)
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  To protect verified serial numbers and high-res issuance diplomas, a $0.50 USD fee grants instant access to inspect all certificate documents (including GCAA Drone Pilot license) and download the official CV.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenPaywall}
              className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors shadow-xs"
            >
              Pay $0.50 to Unlock →
            </button>
          </div>
        ) : (
          <div className="mb-8 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full High-Resolution Certificate Inspection Active! Click any certificate card below to view or print the official document.</span>
            </div>
            {isOwner && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                Owner Mode
              </span>
            )}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const isGcaaDrone = cert.id === 'cert-gcaa-rpas';

            return (
              <div
                key={cert.id}
                onClick={() => handleCardClick(cert)}
                className={`group relative rounded-3xl p-6 transition-all duration-300 border cursor-pointer flex flex-col justify-between ${
                  isGcaaDrone
                    ? 'bg-gradient-to-br from-sky-500/5 via-zinc-50 to-white dark:from-sky-950/20 dark:via-zinc-900 dark:to-zinc-900 border-sky-300 dark:border-sky-800/80 shadow-md hover:shadow-xl hover:border-sky-500'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Featured RPAS Badge if drone */}
                {isGcaaDrone && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold shadow-xs flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    <span>RPAS DRONE PILOT LICENSE</span>
                  </div>
                )}

                <div>
                  {/* Card Top Row: Issuer & Lock Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold ${
                      isGcaaDrone 
                        ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {cert.badge}
                    </span>

                    {/* Lock / Unlocked Pill */}
                    {!isAccessUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Lock className="w-3 h-3" />
                        <span>$0.50</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                    {cert.title}
                  </h3>
                  
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{cert.issuer}</span>
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                {/* Card Bottom: Metadata & View CTA */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{cert.issueDate}</span>
                    </span>

                    <button
                      onClick={(e) => handleCopyId(cert.credentialId, e)}
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                      title="Click to copy credential ID"
                    >
                      <span>ID: {cert.credentialId.substring(0, 14)}...</span>
                      {copiedId === cert.credentialId ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Interactive Button */}
                  <div className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    !isAccessUnlocked
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950'
                      : isGcaaDrone
                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950'
                  }`}>
                    {!isAccessUnlocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-500 group-hover:text-zinc-950" />
                        <span>Unlock & Inspect Certificate ($0.50)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Official Document</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* FULL-SCREEN HIGH-RES CERTIFICATE DOCUMENT MODAL */}
      {selectedCert && isAccessUnlocked && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 no-print">
          <div 
            className="relative bg-zinc-900 border border-zinc-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Controls Bar */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-zinc-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono tracking-wide">
                  OFFICIAL VERIFIED CREDENTIAL • {selectedCert.credentialId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title="Print or Save PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / PDF</span>
                </button>

                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CERTIFICATE DOCUMENT DISPLAY */}
            <div className="p-6 sm:p-10 bg-zinc-100 text-zinc-900 overflow-y-auto max-h-[80vh]">
              
              {/* SPECIFIC GCAA DRONE PILOT CERTIFICATE TEMPLATE (Matched to Uploaded PDF) */}
              {selectedCert.id === 'cert-gcaa-rpas' ? (
                <div className="relative bg-white border-8 border-double border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-lg font-sans overflow-hidden">
                  
                  {/* Quadcopter / Aviation Watermark pattern */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  {/* GCAA Header & Wings Crest */}
                  <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-4 mb-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sky-900 text-white flex flex-col items-center justify-center font-bold text-xs shadow-md">
                        <Plane className="w-6 h-6 text-sky-300" />
                        <span className="text-[9px] font-mono tracking-widest">GCAA</span>
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold tracking-wider text-sky-950 uppercase">
                          Ghana Civil Aviation Authority
                        </h4>
                        <p className="text-[11px] font-mono text-zinc-500">
                          Flight Operations & Air Navigation Services Directorate
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800">
                        RPAS LICENSED
                      </span>
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <div className="text-center my-6">
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 uppercase font-serif">
                      Certificate
                    </h1>
                    <p className="text-sm sm:text-base font-semibold tracking-widest text-sky-700 uppercase mt-1">
                      of Completion
                    </p>
                    
                    <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-amber-500 mx-auto my-3 rounded-full"></div>
                    
                    <p className="text-xs text-zinc-500 italic mt-4">
                      This certificate is proudly presented to
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-2 underline decoration-sky-500 underline-offset-8">
                      {selectedCert.recipientName}
                    </h2>

                    <p className="text-xs text-zinc-600 mt-5">
                      on successful completion of
                    </p>

                    <h3 className="text-lg sm:text-xl font-bold text-sky-900 mt-2 max-w-lg mx-auto leading-snug">
                      Remotely Piloted Aircraft Systems (RPAS) Safety Training
                    </h3>
                  </div>

                  {/* Certificate Footer with Date & QR Code */}
                  <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                    
                    {/* Date and validity */}
                    <div className="text-center sm:text-left">
                      <p className="text-base font-bold text-zinc-900 font-mono">
                        {selectedCert.issueDate}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                        Date of Issue
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 italic">
                        This certificate is valid for one year after date of issue
                      </p>
                    </div>

                    {/* QR Code and verification box */}
                    <div className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                      <div className="w-14 h-14 bg-white border border-zinc-300 rounded p-1 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-zinc-900" />
                      </div>
                      <div className="text-left text-[10px] font-mono">
                        <p className="font-bold text-zinc-800">GCAA VERIFIED</p>
                        <p className="text-zinc-500">{selectedCert.credentialId}</p>
                        <p className="text-emerald-600 font-semibold">Active & Valid</p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* STANDARD CREDENTIAL DISPLAY FOR OTHER CERTIFICATES */
                <div className="bg-white border-4 border-zinc-300 rounded-2xl p-6 sm:p-10 shadow-lg text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-sm">
                    <Award className="w-6 h-6 text-amber-400" />
                  </div>
                  
                  <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                    Official Certificate of Accomplishment
                  </span>

                  <h2 className="text-2xl font-extrabold text-zinc-950">
                    {selectedCert.title}
                  </h2>

                  <p className="text-sm font-semibold text-zinc-600">
                    Conferred by {selectedCert.issuer}
                  </p>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left text-xs text-zinc-700 leading-relaxed">
                    <p className="font-semibold text-zinc-900 mb-1">Scope & Technical Verification:</p>
                    <p>{selectedCert.description}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-500">
                    <span>Recipient: <strong>{selectedCert.recipientName}</strong></span>
                    <span>Issue Date: <strong>{selectedCert.issueDate}</strong></span>
                    <span>Serial: <strong>{selectedCert.credentialId}</strong></span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                Official Credential Document • Verified by {selectedCert.issuer}
              </span>

              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
