import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  Check, 
  Sparkles, 
  User, 
  Moon, 
  Sun, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  AlertCircle,
  Image as ImageIcon,
  Sliders,
  Palette,
  LogOut,
  Percent,
  Tag,
  Trash2
} from 'lucide-react';
import { ProfileData } from '../types';
import { defaultProfile } from '../data/portfolioData';
import { processPassportPhoto, BackdropTheme } from '../utils/backgroundReplacer';
import { formatUsd } from '../hooks/usePricing';
import { MAX_DISCOUNT_PERCENT, useAdminDiscount } from '../hooks/useAdminDiscount';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSaveProfile: (updated: ProfileData) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOwner: boolean;
  onSetOwner: (authenticated: boolean) => void;
  /** Called after the owner changes the resume discount so the portfolio price refreshes. */
  onPricingChanged?: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Danso Passport (Default)',
    url: '/avatar.png',
  },
  {
    name: 'Executive Studio',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Creative Product Designer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Minimalist Portrait',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isDark,
  toggleTheme,
  isOwner,
  onSetOwner,
  onPricingChanged,
}) => {
  // Passcode gate state
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Resume-unlock discount manager (owner only)
  const {
    pricing: adminPricing,
    isLoading: isLoadingDiscount,
    isSaving: isSavingDiscount,
    error: discountError,
    saveDiscount,
    clearDiscount,
  } = useAdminDiscount({ enabled: isOpen && isOwner });
  const [discountInput, setDiscountInput] = useState('0');
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountSaved, setDiscountSaved] = useState(false);

  // Sync the editor with the pricing the server reports for this owner session.
  useEffect(() => {
    setDiscountInput(String(adminPricing.discountPercent));
    setDiscountEnabled(adminPricing.hasDiscount);
  }, [adminPricing.discountPercent, adminPricing.hasDiscount]);

  const handleApplyDiscount = async () => {
    const parsed = Number(discountInput);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_DISCOUNT_PERCENT) {
      return;
    }
    const next = await saveDiscount(parsed, discountEnabled && parsed > 0);
    if (next) {
      onPricingChanged?.();
      setDiscountSaved(true);
      setTimeout(() => setDiscountSaved(false), 2000);
    }
  };

  const handleClearDiscount = async () => {
    const next = await clearDiscount();
    if (next) {
      setDiscountInput('0');
      setDiscountEnabled(false);
      onPricingChanged?.();
    }
  };

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [rawUploadedImage, setRawUploadedImage] = useState<string | null>(null);
  const [backdropTheme, setBackdropTheme] = useState<BackdropTheme>('slate');
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgAppliedMessage, setBgAppliedMessage] = useState<string | null>(null);

  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [urlInput, setUrlInput] = useState('');
  const [savedAlert, setSavedAlert] = useState(false);

  // Authenticate owner
  const handleUnlockOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Owner login failed.');
      }
      onSetOwner(true);
      setPasscodeInput('');
    } catch (error) {
      setPasscodeError(error instanceof Error ? error.message : 'Owner login failed.');
    }
  };

  const handleLockOwner = async () => {
    try {
      const response = await fetch('/api/owner/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not end the owner session.');
      onSetOwner(false);
    } catch (error) {
      console.error('Could not end the owner session:', error);
    }
  };

  // File upload handler (specifically optimized for Danso's passport photo)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingBg(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setRawUploadedImage(base64);

        try {
          const processed = await processPassportPhoto(base64, backdropTheme);
          setAvatarUrl(processed);
          setBgAppliedMessage('Original photo loaded! Red background converted to studio backdrop.');
        } catch {
          setAvatarUrl(base64);
        } finally {
          setIsProcessingBg(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Change background theme on existing uploaded photo
  const handleThemeChange = async (theme: BackdropTheme) => {
    setBackdropTheme(theme);
    const sourceImage = rawUploadedImage || avatarUrl;
    setIsProcessingBg(true);
    try {
      const processed = await processPassportPhoto(sourceImage, theme);
      setAvatarUrl(processed);
      setBgAppliedMessage(`Backdrop updated to ${theme} while keeping your exact face & outfit untouched.`);
    } catch {
      // Keep current
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setAvatarUrl(urlInput.trim());
      setRawUploadedImage(null);
      setUrlInput('');
    }
  };

  const handleSave = () => {
    const updated: ProfileData = {
      ...profile,
      avatarUrl,
      name,
      title,
      bio,
      email,
      location,
    };
    onSaveProfile(updated);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setAvatarUrl(defaultProfile.avatarUrl);
    setRawUploadedImage(null);
    setName(defaultProfile.name);
    setTitle(defaultProfile.title);
    setBio(defaultProfile.bio);
    setEmail(defaultProfile.email);
    setLocation(defaultProfile.location);
    setBgAppliedMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 no-print">
      <div 
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isOwner ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
              {isOwner ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  Site Editor & Preferences
                </h2>
                {isOwner && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white">
                    Owner Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {isOwner 
                  ? 'Authenticated as Danso Robert Opoku. You have full edit rights.' 
                  : 'Editing is restricted to the site owner. Visitors have read-only access.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Toast */}
        {savedAlert && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Profile and settings saved successfully! Updated across your entire portfolio.</span>
          </div>
        )}

        {/* OWNER ACCESS GATE: IF NOT LOGGED IN AS OWNER */}
        {!isOwner ? (
          <div className="p-8 sm:p-10 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Owner Authentication Required
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                To prevent unauthorized edits, only <strong>Danso Robert Opoku</strong> has permission to modify profile pictures, biography, and portfolio configuration.
              </p>
            </div>

            <form onSubmit={handleUnlockOwner} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-zinc-500 text-left mb-1.5">
                  Enter Owner Passcode:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Owner passcode"
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setPasscodeError(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {passcodeError && (
                  <p className="text-xs text-rose-500 text-left mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passcodeError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4 text-emerald-500" />
                <span>Unlock Owner Editing Controls</span>
              </button>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 text-left">
                Owner access is verified by the server. Configure <code>OWNER_PASSCODE</code> in the server environment before logging in.
              </div>
            </form>
          </div>
        ) : (
          /* OWNER AUTHENTICATED: FULL EDITING CONTROLS */
          <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-12rem)] overflow-y-auto">
            
            {/* Owner Status Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Owner Authenticated: Danso Robert Opoku
                </span>
              </div>
              <button
                onClick={handleLockOwner}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                title="Lock editor for public visitors"
              >
                <LogOut className="w-3 h-3" />
                <span>Lock Editor</span>
              </button>
            </div>

            {/* SECTION 1: PASSPORT PHOTO UPLOADER & BACKGROUND REPLACER */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  Your Authentic Passport Photo
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Preserves Your Face & Clothes 100%
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Preview Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-emerald-500/30 dark:ring-emerald-400/30 shadow-md bg-zinc-900"
                  />
                  {isProcessingBg && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white text-[11px] font-mono">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
                </div>

                {/* Upload & Controls */}
                <div className="flex-1 w-full space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Select your real <strong>Passport .png</strong>. The tool keeps your exact face, haircut, smile, suit, and tie, and swaps the solid red backdrop for a clean studio finish.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Passport .png</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setAvatarUrl(defaultProfile.avatarUrl)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Style Switcher */}
              <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-700/40">
                <span className="text-[11px] font-mono text-zinc-500 block mb-2 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-500" /> Choose Background Style (Leaves Your Person Intact):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'slate', label: 'Studio Slate', color: 'bg-slate-700' },
                    { id: 'charcoal', label: 'Dark Charcoal', color: 'bg-zinc-900' },
                    { id: 'light', label: 'Executive Light', color: 'bg-slate-200 text-zinc-900' },
                    { id: 'transparent', label: 'Cutout (Alpha)', color: 'bg-zinc-600' },
                    { id: 'original', label: 'Original Red', color: 'bg-red-600' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => handleThemeChange(bg.id as BackdropTheme)}
                      className={`p-2 rounded-xl text-[11px] font-medium border text-center transition-all flex flex-col items-center gap-1.5 ${
                        backdropTheme === bg.id
                          ? 'border-emerald-500 bg-white dark:bg-zinc-900 shadow-xs ring-1 ring-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${bg.color} border border-white/20 shadow-xs`}></span>
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>

                {bgAppliedMessage && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                    ✓ {bgAppliedMessage}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: EDITABLE PROFILE METADATA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Identity & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Biography Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Base Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PASSCODE SECURITY */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Owner Passcode Security</span>
              </h4>
              <p className="text-[11px] text-zinc-500">
                The server validates the passcode from <code>OWNER_PASSCODE</code>. Update it in the server environment, never in browser storage.
              </p>
            </div>

            {/* SECTION 4: THEME TOGGLE */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Interface Color Scheme
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Currently running in {isDark ? 'Dark Mode' : 'Light Mode'}.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>
            </div>

            {/* SECTION 5: COOKIE & PRIVACY */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Cookies & Local Storage
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Manage essential, functional, and performance cookies.
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('danso_cookie_consent');
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs"
              >
                <span>Manage Cookies</span>
              </button>
            </div>

            {/* SECTION 6: RESUME UNLOCK DISCOUNT MANAGER */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Resume Unlock Discount</span>
                </h4>
                {adminPricing.hasDiscount && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white">
                    {adminPricing.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                  {formatUsd(adminPricing.finalPriceUsd)}
                </span>
                {adminPricing.hasDiscount && (
                  <span className="text-xs text-zinc-400 line-through font-mono">
                    {formatUsd(adminPricing.basePriceUsd)}
                  </span>
                )}
                <span className="text-[11px] text-zinc-500">charged at checkout</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={discountEnabled}
                    onChange={(e) => setDiscountEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active</span>
                </label>

                <div className="flex items-center gap-2 flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="number"
                    min={0}
                    max={MAX_DISCOUNT_PERCENT}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                  <span className="text-xs text-zinc-500">% off (0–{MAX_DISCOUNT_PERCENT})</span>
                </div>
              </div>

              {discountError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {discountError}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={isLoadingDiscount || isSavingDiscount}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingDiscount ? 'Applying…' : 'Apply Discount'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearDiscount}
                  disabled={isLoadingDiscount || isSavingDiscount}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
                {discountSaved && (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">✓ Saved</span>
                )}
              </div>

              <p className="text-[11px] text-zinc-500">
                The discount is stored server-side, so the price shown on the paywall, resume section, and checkout always match.
              </p>
            </div>

          </div>
        )}

        {/* Modal Footer (Only shown when owner is authenticated) */}
        {isOwner && (
          <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
            >
              Reset All Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Apply</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
