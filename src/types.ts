export type ProjectCategory = 
  | 'All' 
  | 'Full-Stack' 
  | 'Cloud & Database' 
  | 'AI & Systems' 
  | 'Fintech' 
  | 'Open Source';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  fullCaseStudy: {
    overview: string;
    challenge: string;
    architecture: string;
    databaseDesign: string;
    keyResults: string[];
  };
  metrics: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  imageUrl: string;
  year: string;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  description: string;
  achievements: string[];
  techStack: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  honors?: string;
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  skills: { name: string; level: number; highlight?: boolean }[];
}

export interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  backgroundStory: string;
  location: string;
  email: string;
  phone?: string;
  website: string;
  avatarUrl: string;
  statusText: string;
  availableForHire: boolean;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    email: string;
  };
}

export interface InquiryMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  inquiryType: string;
  budget?: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: 'delivered' | 'read' | 'pending';
}

export interface WorkGalleryImage {
  id: string;
  imageUrl: string;
}

export interface WorkProject {
  id: string;
  title: string;
  caption: string;
  images: WorkGalleryImage[];
  createdAt: string;
}
