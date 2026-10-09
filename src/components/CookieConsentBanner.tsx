import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  X, 
  Check, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Sliders, 
  Info,
  ChevronRight
} from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  functional: boolean;
}

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    // Check if consent has already been recorded
    const saved = localStorage.getItem('danso_cookie_consent');
    if (!saved) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
    };
    setPreferences(fullConsent);
    localStorage.setItem('danso_cookie_consent', JSON.stringify(fullConsent));
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleAcceptEssentialOnly = () => {
    const minimalConsent: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
    };
    setPreferences(minimalConsent);
    localStorage.setItem('danso_cookie_consent', JSON.stringify(minimalConsent));
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('danso_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  if (!isVisible && !isCustomizeOpen) return null;

  return (
    <>
      {/* Floating Minimalist Cookie Banner */}
      {isVisible && !isCustomizeOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 no-print">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-5 shadow-2xl text-zinc-900 dark:text-zinc-100">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight">
                    Cookie & Privacy Notice
                  </h3>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                    aria-label="Dismiss banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  We use cookies and local storage to remember your dark mode settings, save your profile edits, and ensure smooth portfolio navigation.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3.5 rounded-xl text-xs font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                Accept All
              </button>

              <button
                onClick={handleAcceptEssentialOnly}
                className="py-2 px-3 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Essential Only
              </button>

              <button
                onClick={() => setIsCustomizeOpen(true)}
                className="py-2 px-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center gap-1"
                title="Customize preferences"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Cookie Preferences
                </h3>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Customize which categories of cookies and browser storage you wish to allow during your visit. Essential storage is required for fundamental site operations.
            </p>

            {/* Cookie Categories */}
            <div className="space-y-3">
              
              {/* Category 1: Essential */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Essential & System Cookies
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Necessary for theme toggle persistence (Dark/Light mode), form submission security, and core UI rendering.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-1 opacity-75 cursor-not-allowed"
                />
              </div>

              {/* Category 2: Functional */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Functional & Profile Preferences
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Stores custom avatar edits, notification badge receipts, and search filter states across page reloads.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Category 3: Analytics */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Analytics & Performance
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Anonymous telemetry tracking for portfolio project views and page interaction speed to improve user experience.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleAcceptAll}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
              >
                Accept All
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
