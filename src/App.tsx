/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { defaultProfile, projectsData, experienceData, educationData } from './data/portfolioData';
import { ProfileData, InquiryMessage } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ResumeSection } from './components/ResumeSection';
import { CertificatesVault } from './components/CertificatesVault';
import { AiStudioSection } from './components/AiStudioSection';
import { ContactSection } from './components/ContactSection';
import { WorkGallerySection } from './components/WorkGallerySection';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ResumePaywallModal } from './components/ResumePaywallModal';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('danso_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Owner authentication state (only Danso can edit)
  const [isOwner, setIsOwner] = useState(false);

  // Resume $0.50 paywall state
  const [hasPaidResume, setHasPaidResume] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('danso_resume_paid') === 'true';
    }
    return false;
  });

  // Paywall modal visibility
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // User Profile state (with localStorage persistence so avatar updates persist)
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('danso_profile_v2');
      if (stored) {
        try {
          return { ...defaultProfile, ...JSON.parse(stored) };
        } catch (e) {
          console.error('Failed to parse cached profile', e);
        }
      }
    }
    return defaultProfile;
  });

  // Notifications & Messages state
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cookieBannerKey, setCookieBannerKey] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  const handleOpenCookieSettings = () => {
    localStorage.removeItem('danso_cookie_consent');
    setCookieBannerKey(prev => prev + 1);
  };

  // Apply dark class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('danso_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('danso_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Save profile updates to state and localStorage
  const handleSaveProfile = (updated: ProfileData) => {
    if (!isOwner) return;
    setProfile(updated);
    localStorage.setItem('danso_profile_v2', JSON.stringify(updated));
  };

  // Direct avatar update (e.g. from AI studio generator)
  const handleUpdateAvatar = (newUrl: string) => {
    if (!isOwner) return;
    const updated = { ...profile, avatarUrl: newUrl };
    handleSaveProfile(updated);
  };

  // Owner Authentication toggle & persistence
  const handleSetOwner = (authenticated: boolean) => {
    setIsOwner(authenticated);
    if (!authenticated) {
      setMessages([]);
      setUnreadCount(0);
      setIsNotificationsOpen(false);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('danso_is_owner');
    }
  };

  useEffect(() => {
    const checkOwnerSession = async () => {
      try {
        const response = await fetch('/api/owner/session');
        if (!response.ok) throw new Error('Owner session validation failed.');
        const data = await response.json();
        handleSetOwner(data.isOwner === true);
      } catch (error) {
        console.error('Could not validate the owner session:', error);
        handleSetOwner(false);
      }
    };
    void checkOwnerSession();
  }, []);

  // Paywall handling ($0.50 CV download gate)
  const handleOpenPaywall = () => {
    if (isOwner || hasPaidResume) {
      window.requestAnimationFrame(() => window.print());
      return;
    }
    setIsPaywallOpen(true);
  };

  const handlePaymentSuccess = () => {
    setHasPaidResume(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('danso_resume_paid', 'true');
    }
    setTimeout(() => {
      window.requestAnimationFrame(() => window.print());
    }, 400);
  };

  // Fetch incoming messages from server
  const fetchMessages = async () => {
    if (!isOwner) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        throw new Error(`Messages request failed with status ${res.status}.`);
      }
    } catch (error) {
      console.error('Could not load owner messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [isOwner]);

  // Mark single message as read
  const handleMarkAsRead = async (id: string) => {
    if (!isOwner) return;
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`Mark-as-read failed with status ${res.status}.`);
      const data = await res.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Could not mark owner message as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!isOwner) return;
    try {
      const res = await fetch('/api/messages/mark-all-read', { method: 'POST' });
      if (!res.ok) throw new Error(`Mark-all-read failed with status ${res.status}.`);
      const data = await res.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Could not mark all owner messages as read:', error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    if (!isOwner) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Message deletion failed with status ${res.status}.`);
      const data = await res.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Could not delete owner message:', error);
    }
  };

  // Send a test message to demo the notification badge in action
  const handleSendTestMessage = async () => {
    if (!isOwner) return;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Apex Venture Capital (Recruiting)',
          email: 'talent@apexventures.io',
          subject: 'UI/UX & Product Design Leadership Discussion with Danso',
          inquiryType: 'UI/UX Design & Full-time Role',
          budget: '$85k - $120k',
          message: 'Hello Danso, our team reviewed your UI/UX design case studies for Aradad Homes and Honeycave Market and would like to invite you for an executive discussion.',
        }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (e) {
      console.error('Failed to trigger test message', e);
    }
  };

  // Scroll spy to highlight active section in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'projects', 'gallery', 'experience', 'resume', 'certificates', 'ai-studio', 'contact'];
      const scrollY = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        unreadCount={unreadCount}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        activeSection={activeSection}
        isOwner={isOwner}
        onOpenPaywall={handleOpenPaywall}
        hasPaidResume={hasPaidResume}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          profile={profile}
          onOpenContact={() => {
            const el = document.getElementById('contact');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          isOwner={isOwner}
          onOpenPaywall={handleOpenPaywall}
          hasPaidResume={hasPaidResume}
        />

        {/* About Danso */}
        <AboutSection profile={profile} />

        {/* Selected Work & Animated Gallery Grid */}
        <ProjectsSection projects={projectsData} />

        {/* Public work photo gallery with owner-only uploads */}
        <WorkGallerySection isOwner={isOwner} />

        {/* Professional Career & Background History */}
        <ExperienceSection
          profile={profile}
          experiences={experienceData}
          education={educationData}
        />

        {/* Downloadable PDF Resume Section ($0.50 paywall for non-owners) */}
        <ResumeSection
          profile={profile}
          experiences={experienceData}
          education={educationData}
          isOwner={isOwner}
          onOpenPaywall={handleOpenPaywall}
          hasPaidResume={hasPaidResume}
        />

        {/* Verified Credentials & Certificates Vault ($0.50 paywall for non-owners) */}
        <CertificatesVault
          isOwner={isOwner}
          hasUnlocked={hasPaidResume}
          onOpenPaywall={handleOpenPaywall}
        />

        {/* Gemini Vision & Creative Studio (Create & Analyze Images) */}
        <AiStudioSection
          profile={profile}
          onUpdateAvatar={handleUpdateAvatar}
          isOwner={isOwner}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Contact Page & Customized Inquiry Form */}
        <ContactSection
          profile={profile}
          onMessageSent={() => {
            fetchMessages();
          }}
        />
      </main>

      {/* Footer */}
      <Footer 
        profile={profile} 
        onOpenCookieSettings={handleOpenCookieSettings} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Cookie Consent & Privacy Preferences */}
      <CookieConsentBanner key={cookieBannerKey} />

      {/* Profile Picture & Settings Modal (Protected: Owner Only) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isOwner={isOwner}
        onSetOwner={handleSetOwner}
      />

      {/* Resume Paywall Modal ($0.50 Micro-Payment Gateway) */}
      <ResumePaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        isOwner={isOwner}
      />

      {/* Inquiry Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        messages={messages}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteMessage={handleDeleteMessage}
        onSendTestMessage={handleSendTestMessage}
      />

    </div>
  );
}
