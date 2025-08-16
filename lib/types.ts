// lib/types.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'career-results' | 'resume-analysis' | 'skill-roadmap' | 'job-listings';
  data?: any;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  match: number;
  salary: string;
  growth: string;
  description: string;
  skills: string[];
  demand: 'High' | 'Medium' | 'Low';
  education?: string;
  experience?: string;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  rating: number;
  students: string;
  price: string;
  skills: string[];
  progress?: number;
}

export interface KeywordAnalysis {
  missing: string[];
  overused: string[];
  recommended: string[];
}

export interface ImprovedSection {
  original: string;
  improved: string;
  explanation: string;
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  improvedSections: ImprovedSection[];
  atsScore: number;
  keywordAnalysis: KeywordAnalysis;
  generatedResume?: string;
}

export interface ResumeData {
  originalText: string;
  analysis: {
    improvements: string[];
    improvedSections: ImprovedSection[];
    keywordAnalysis: KeywordAnalysis;
  };
  format: 'chronological' | 'functional' | 'combination';
}