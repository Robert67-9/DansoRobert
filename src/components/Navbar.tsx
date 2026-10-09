import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  X, 
  Download, 
  Send,
  ExternalLink,
  Code2
} from 'lucide-react';
import { ProfileData } from '../types';

interface NavbarProps {
  profile: ProfileData;
  unreadCount: number;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenNotifications: () => void;
  activeSection: string;
  isOwner?: boolean;
  onOpenPaywall?: () => void;
  hasPaidResume?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  unreadCount,
  isDark,
  toggleTheme,
  onOpenNotifications,
  activeSection,
  isOwner = false,
  onOpenPaywall,
  hasPaidResume = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#projects' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Experience', href: '#experience' },
    { label: 'CV / Resume', href: '#resume' },
    { label: 'Certificates', href: '#certificates' },
    { label: 'AI Lab', href: '#ai-studio' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 no-print ${
        scrolled 
          ? 'bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 py-3 shadow-xs' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand & Profile Picture preview */}
          <a 
            href="#" 
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-lg p-1"
          >
            <div className="relative">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-zinc-300 dark:ring-zinc-700 group-hover:ring-zinc-900 dark:group-hover:ring-zinc-100 transition-all shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                {profile.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hidden sm:block">
                UI/UX Designer • IT Consultant • Drone Pilot (RPAS)
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 p-1.5 rounded-full backdrop-blur-xs">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                    isActive 
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Private inbox is only available to the authenticated owner. */}
            {isOwner && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors focus:outline-none"
                title="Incoming inquiries & messages"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors focus:outline-none"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Resume button */}
            <a
              href="#resume"
              onClick={(e) => {
                if (!isOwner && !hasPaidResume && onOpenPaywall) {
                  e.preventDefault();
                  onOpenPaywall();
                }
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resume</span>
              {!isOwner && !hasPaidResume ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white">
                  $0.50
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              )}
            </a>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus:outline-none"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-3 p-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-1">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{profile.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">dansorobert360@gmail.com</p>
              </div>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <a
                href="#resume"
                onClick={(event) => {
                  setMobileMenuOpen(false);
                  if (onOpenPaywall) {
                    event.preventDefault();
                    onOpenPaywall();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <Download className="w-3.5 h-3.5" />
                Download CV
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
