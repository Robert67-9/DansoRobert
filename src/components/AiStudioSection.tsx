import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Scan, 
  RefreshCw, 
  Download, 
  Check, 
  AlertCircle, 
  Cpu, 
  CheckCircle,
  Sliders,
  UserCheck
} from 'lucide-react';
import { ProfileData } from '../types';

interface AiStudioSectionProps {
  profile: ProfileData;
  onUpdateAvatar: (newUrl: string) => void;
  isOwner?: boolean;
  onOpenSettings?: () => void;
}

export const AiStudioSection: React.FC<AiStudioSectionProps> = ({
  profile,
  onUpdateAvatar,
  isOwner = false,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');

  // Generate / Edit state
  const [genPrompt, setGenPrompt] = useState('Minimalist abstract geometric architecture representing high-throughput PostgreSQL databases and clean lines');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [genResultUrl, setGenResultUrl] = useState<string | null>(null);
  const [genDescription, setGenDescription] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [avatarApplied, setAvatarApplied] = useState(false);

  // Analyze state
  const [analyzeImage, setAnalyzeImage] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'ux_code' | 'architecture' | 'creative'>('ux_code');
  const [analyzePrompt, setAnalyzePrompt] = useState('Audit this interface for visual hierarchy, usability, accessibility, and modern minimalist design.');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Handle image upload for Generate/Edit
  const handleBaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for Analysis
  const handleAnalyzeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalyzeImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Image Generation / Editing (gemini-3.1-flash-image-preview)
  const handleGenerateImage = async () => {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    setGenError(null);
    setAvatarApplied(false);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: genPrompt,
          baseImageBase64: baseImage,
          aspectRatio: '1:1',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      if (data.imageUrl) {
        setGenResultUrl(data.imageUrl);
        setGenDescription(data.description || null);
      } else {
        // Fallback demo image if text guidance was returned
        setGenDescription(data.textOutput || data.message || 'Image description synthesized.');
        setGenResultUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
      }
    } catch (err: any) {
      setGenError(err.message || 'Error communicating with Gemini model.');
    } finally {
      setGenLoading(false);
    }
  };

  // Trigger Image Analysis (gemini-3.1-pro-preview)
  const handleAnalyze = async () => {
    if (!analyzeImage) {
      setAnalyzeError('Please upload an image or screenshot to analyze.');
      return;
    }

    setAnalyzeLoading(true);
    setAnalyzeError(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: analyzeImage,
          prompt: analyzePrompt,
          analysisType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze image.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setAnalyzeError(err.message || 'Analysis failed. Please verify API configuration.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <section id="ai-studio" className="py-20 md:py-28 border-t border-zinc-200/70 dark:border-zinc-800/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Interactive AI Lab</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Gemini Vision & Creative Studio
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
              Test cutting-edge multi-modal AI capabilities directly in Danso's portfolio: generate creative project assets with <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">gemini-3.1-flash-image-preview</code> or analyze UI mockups with <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">gemini-3.1-pro-preview</code>.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'generate'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Create & Edit Images
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'analyze'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Scan className="w-4 h-4 text-purple-500" />
              Analyze Photo / UI
            </button>
          </div>
        </div>

        {/* Tab 1: Create & Edit Images */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Creative Text Prompt
                  </label>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    gemini-3.1-flash-image-preview
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  placeholder="Describe the image or transformation to generate..."
                  className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all resize-none"
                />
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] font-mono text-zinc-400 block mb-2">
                  Quick Prompt Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Minimalist monochrome avatar of a software architect in studio lighting',
                    'Abstract architectural wireframe of distributed cloud nodes with neon green pulse',
                    'Sleek dark-mode analytics dashboard interface with real-time graphs'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGenPrompt(preset)}
                      className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      {preset.substring(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Base Image to Edit */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Optional Reference Image (To Edit / Stylize)
                  </label>
                  {baseImage && (
                    <button
                      onClick={() => setBaseImage(null)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {baseImage ? (
                  <div className="relative h-28 w-28 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
                    <img src={baseImage} alt="Reference" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Upload photo to edit or restyle
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBaseImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {genError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              <button
                onClick={handleGenerateImage}
                disabled={genLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {genLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Synthesizing Image with Gemini...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Generate / Edit with gemini-3.1-flash-image-preview</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Visualizer (6 cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center min-h-[420px]">
              {genResultUrl ? (
                <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-xl ring-2 ring-zinc-300 dark:ring-zinc-700 bg-zinc-950">
                    <img
                      src={genResultUrl}
                      alt="Gemini Output"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {genDescription && (
                    <p className="text-xs text-zinc-500 text-center max-w-sm italic">
                      {genDescription}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (!isOwner) {
                          onOpenSettings?.();
                          return;
                        }
                        onUpdateAvatar(genResultUrl);
                        setAvatarApplied(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                    >
                      {avatarApplied ? <Check className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>
                        {!isOwner 
                          ? '🔒 Owner Only: Apply as Profile Photo' 
                          : avatarApplied 
                            ? 'Applied as Profile Photo!' 
                            : 'Use as Danso’s Profile Picture'}
                      </span>
                    </button>

                    <a
                      href={genResultUrl}
                      download="danso_creative_asset.png"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-sm text-zinc-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    AI Canvas Awaiting Instructions
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Type a prompt on the left and hit generate to render high-fidelity graphics with Gemini.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Analyze Photos / Code with gemini-3.1-pro-preview */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Upload & Configuration (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Upload Photo / Screenshot / Diagram
                  </label>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                    gemini-3.1-pro-preview
                  </span>
                </div>

                {analyzeImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 max-h-56">
                    <img src={analyzeImage} alt="To analyze" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setAnalyzeImage(null)}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-medium backdrop-blur-xs"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Click to upload UI mockup, photo, or wireframe
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">PNG, JPG, or WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAnalyzeUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Sample test images */}
              <div>
                <span className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Or test with sample images:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnalyzeImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80');
                      setAnalysisResult(null);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Sample UI Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnalyzeImage('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80');
                      setAnalysisResult(null);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Sample Cloud Server
                  </button>
                </div>
              </div>

              {/* Inspection Mode */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono block mb-2">
                  Analysis Lens
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ux_code', label: 'UI/UX & Code' },
                    { id: 'architecture', label: 'Cloud Architecture' },
                    { id: 'creative', label: 'Aesthetics & Style' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAnalysisType(mode.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all ${
                        analysisType === mode.id
                          ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono block mb-1.5">
                  Inspection Query
                </label>
                <input
                  type="text"
                  value={analyzePrompt}
                  onChange={(e) => setAnalyzePrompt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {analyzeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{analyzeError}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={analyzeLoading || !analyzeImage}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {analyzeLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Image with gemini-3.1-pro-preview...</span>
                  </span>
                ) : (
                  <>
                    <Scan className="w-4 h-4 text-purple-400" />
                    <span>Run Gemini 3.1 Pro Inspection</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Output (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs min-h-[460px]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                    Gemini 3.1 Pro Intelligence Audit
                  </h3>
                </div>
                {analysisResult && (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    Audit Complete
                  </span>
                )}
              </div>

              {analysisResult ? (
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap space-y-3 font-sans">
                  {analysisResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center text-zinc-400">
                  <Scan className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    No active analysis
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1">
                    Upload an interface, architectural diagram, or photo and execute an inspection to receive Gemini's structured feedback.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
