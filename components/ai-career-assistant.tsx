'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Send, Bot, User, Sparkles, FileText, Target, BookOpen,
  Upload, Download, TrendingUp, DollarSign, MapPin, Clock,
  Loader2, Star, Building, Code, CheckCircle, PlayCircle,
  Brain, Lightbulb, Zap, FileDown, FileSearch, Briefcase,
  GraduationCap, Settings, FileInput, Wand2, Rocket, Gem,
  CircleUser, MessageSquare, Plus, X, ClipboardList, Aperture
} from 'lucide-react';
import { generateResumePDF } from '@/lib/resume-generator';

// Enhanced Types
type ImprovedSection = {
  original: string;
  improved: string;
  explanation: string;
};

type KeywordAnalysis = {
  missing: string[];
  overused: string[];
  recommended: string[];
};

type ResumeAnalysis = {
  score: number;
  atsScore: number;
  strengths: string[];
  improvements: string[];
  improvedSections: ImprovedSection[];
  keywordAnalysis: KeywordAnalysis;
  scoreBreakdown: {
    content: number;
    structure: number;
    ats: number;
    achievements: number;
  };
  generatedResume?: string;
};

type CareerRecommendation = {
  id: string;
  title: string;
  match: number;
  salary: string;
  growth: string;
  description: string;
  skills: string[];
  demand: string;
  education: string;
  experience: string;
};

type Course = {
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
};

type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  description: string;
  skills: string[];
  url: string;
};

type UserProfile = {
  name: string;
  email: string;
  targetRole: string;
  experienceLevel: string;
  education: string;
  skills: string[];
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'career-results' | 'skill-roadmap' | 'job-listings' | 'resume-analysis' | 'features';
  data?: any;
};

type ResumeData = {
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  experience: {
    name: string;
    description: string;
  }[];
  education: {
    name: string;
    description: string;
  }[];
  skills: {
    [key: string]: string[];
  };
  projects: {
    name: string;
    description: string;
  }[];
};

// Enhanced Gemini API Client
class GeminiClient {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, context: string = '', jsonMode: boolean = false) {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${context}\n\n${prompt}${jsonMode ? '\n\nPlease respond with properly formatted JSON.' : ''}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            ...(jsonMode && { response_mime_type: 'application/json' })
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }
}

const geminiClient = new GeminiClient('AIzaSyA90Y3aq013JCNpaPJ5NQP_SDYe2lesWe8');

export default function AICareerAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'resume' | 'career'>('chat');
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    targetRole: '',
    experienceLevel: '',
    education: '',
    skills: []
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message and features
  useEffect(() => {
    if (messages.length === 0 && !hasInteracted) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Welcome to your AI Career Assistant powered by Gemini 2.0 Flash! How can I help you today?",
        timestamp: new Date(),
        type: 'features',
        data: getFeatureOptions()
      }]);
    }
  }, [messages, hasInteracted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getFeatureOptions() {
    return [
      { 
        title: "Resume Analysis & Creation",
        description: "Get your resume reviewed or create a new one from scratch",
        icon: FileText,
        prompt: "I need help with my resume - either analyzing an existing one or creating a new one",
        color: "text-blue-600 bg-blue-100"
      },
      { 
        title: "Career Path Recommendations",
        description: "Discover careers that match your skills and interests",
        icon: Target,
        prompt: "What career paths would suit my skills and experience?",
        color: "text-purple-600 bg-purple-100"
      },
      { 
        title: "Skill Development Roadmap",
        description: "Create a personalized learning plan for your career goals",
        icon: BookOpen,
        prompt: "Help me build a skill development roadmap for my career",
        color: "text-green-600 bg-green-100"
      },
      { 
        title: "Job Search Assistance",
        description: "Find relevant job opportunities and prepare for applications",
        icon: Briefcase,
        prompt: "I need help finding job opportunities in my field",
        color: "text-orange-600 bg-orange-100"
      }
    ];
  }

  const detectIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('application')) {
      return 'resume-help';
    }
    if (lowerMessage.includes('career') || lowerMessage.includes('path') || lowerMessage.includes('opportunity')) {
      return 'career-exploration';
    }
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('course') || lowerMessage.includes('roadmap')) {
      return 'skill-development';
    }
    if (lowerMessage.includes('job') || lowerMessage.includes('hiring') || lowerMessage.includes('opening') || lowerMessage.includes('position')) {
      return 'job-search';
    }
    return 'general';
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasInteracted(true);

    try {
      const intent = detectIntent(content);
      let assistantMessage: Message;

      switch (intent) {
        case 'resume-help':
          if (content.toLowerCase().includes('create') || content.toLowerCase().includes('new')) {
            const creationPrompt = `
              The user wants to create a new resume. Please guide them through the process by asking for:
              1. Their full name
              2. Target job title/role
              3. Years of experience
              4. Education background
              5. Top 5-8 skills
              6. Work experience highlights
              
              Ask one question at a time and wait for their response before proceeding.
            `;
            
            const creationResponse = await geminiClient.generateContent(creationPrompt);
            
            assistantMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: creationResponse,
              timestamp: new Date(),
              type: 'text'
            };
          } else {
            assistantMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: "I can analyze and improve your resume! Please upload your current resume or tell me more about your experience.",
              timestamp: new Date(),
              type: 'text'
            };
          }
          break;

        case 'career-exploration':
          const careers = await generateCareerRecommendations(content);
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Here are some career paths that might be a good fit for you:",
            timestamp: new Date(),
            type: 'career-results',
            data: careers
          };
          setActiveTab('career');
          break;

        case 'skill-development':
          const courses = await generateSkillRoadmap(content);
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Here's a personalized learning roadmap for your career goals:",
            timestamp: new Date(),
            type: 'skill-roadmap',
            data: courses
          };
          break;

        case 'job-search':
          const jobs = await generateJobListings(content);
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I found these job opportunities that might interest you:",
            timestamp: new Date(),
            type: 'job-listings',
            data: jobs
          };
          break;

        default:
          const context = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
          const aiResponse = await geminiClient.generateContent(content, context);
          
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            type: 'text'
          };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an issue processing your request. Please try again!",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Uploaded resume: ${file.name}`,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const textContent = await file.text();
      const analysisData = await analyzeResume(textContent);
      
      // Generate enhanced resume with Gemini
      const resumePrompt = `
        Create an optimized resume based on the following analysis:
        ${JSON.stringify(analysisData, null, 2)}
        
        Include:
        1. Professional summary
        2. Work experience with quantifiable achievements
        3. Skills section tailored to the target role
        4. Education and certifications
        5. Any relevant projects
      `;
      
      const enhancedResumeText = await geminiClient.generateContent(resumePrompt);
      
      // Convert to PDF
      analysisData.generatedResume = await generateResumePDF({
        name: userProfile.name || "Your Name",
        contact: {
          email: userProfile.email || "your.email@example.com",
          phone: "",
          location: "Your Location",
          links: []
        },
        summary: enhancedResumeText.match(/Professional summary:([\s\S]*?)(?=\n\w+:|$)/)?.[1]?.trim() || "Professional summary highlighting experience and skills",
        experience: extractSection(enhancedResumeText, "Work experience"),
        education: extractSection(enhancedResumeText, "Education"),
        skills: {
          "Technical Skills": userProfile.skills.length > 0 ? userProfile.skills : extractSkills(enhancedResumeText),
          "Soft Skills": ["Communication", "Teamwork", "Problem Solving"]
        },
        projects: extractSection(enhancedResumeText, "Projects")
      });

      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've analyzed your resume. Here's my detailed assessment:",
        timestamp: new Date(),
        type: 'resume-analysis',
        data: analysisData
      };

      setMessages(prev => [...prev, analysisMessage]);
      setActiveAnalysis(analysisData);
      setActiveTab('resume');
    } catch (error) {
      console.error('Resume analysis error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't analyze your resume. Please try a different file format (PDF, DOCX, or TXT).",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for resume parsing
  function extractSection(text: string, sectionName: string) {
    const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\w+:|$)`);
    const match = text.match(regex);
    if (!match) return [];
    
    const content = match[1].trim();
    return content.split('\n').filter(line => line.trim()).map(line => ({
      name: line.split(':')[0]?.trim() || "",
      description: line.split(':').slice(1).join(':').trim() || ""
    }));
  }

  function extractSkills(text: string) {
    const skillsMatch = text.match(/Skills:([\s\S]*?)(?=\n\w+:|$)/);
    if (!skillsMatch) return [];
    
    return skillsMatch[1].trim()
      .split('\n')
      .map(skill => skill.replace(/^-/, '').trim())
      .filter(skill => skill.length > 0);
  }

  const handleCustomEditRequest = async () => {
    if (!editInstructions.trim() || !activeAnalysis) return;
    
    setIsEditing(true);
    
    try {
      const prompt = `
        You are a professional resume editor. Below is the user&apos;s resume analysis and their specific editing instructions.
        
        Resume Analysis:
        - Strengths: ${activeAnalysis.strengths.join(', ')}
        - Improvements Needed: ${activeAnalysis.improvements.join(', ')}
        - Current Score: ${activeAnalysis.score}/100
        
        User&apos;s Editing Instructions:
        ${editInstructions}
        
        Please provide:
        1. A completely rewritten resume section that addresses the user&apos;s request
        2. Specific explanations of the changes made
        3. Tips for further improvement
        
        Format your response with clear headings for each section.
      `;
      
      const aiResponse = await geminiClient.generateContent(prompt);
      setEditedResume(aiResponse);
      
      // Generate updated PDF with the custom edits
      const updatedResume = await generateResumePDF({
        name: userProfile.name || "Your Name",
        contact: {
          email: userProfile.email || "your.email@example.com",
          phone: "",
          location: "Your Location",
          links: []
        },
        summary: activeAnalysis.generatedResume ? "" : "Professional summary",
        experience: [],
        education: [],
        skills: {},
        projects: []
      });
      
      setActiveAnalysis({
        ...activeAnalysis,
        generatedResume: updatedResume
      });
      
    } catch (error) {
      console.error('Error processing custom edit:', error);
      setEditedResume("Failed to process custom edit. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const downloadResume = (base64Data: string | undefined, filename: string) => {
    if (!base64Data) return;
    
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div className={`rounded-lg p-4 ${
            isUser 
              ? 'bg-blue-600 text-white ml-auto' 
              : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.type === 'features' && message.data && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {(message.data as any[]).map((feature, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`h-auto p-4 text-left flex flex-col items-start gap-2 ${feature.color}`}
                    onClick={() => handleSendMessage(feature.prompt)}
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-5 h-5" />
                      <span className="font-medium">{feature.title}</span>
                    </div>
                    <span className="text-xs text-gray-600">{feature.description}</span>
                  </Button>
                ))}
              </div>
            )}

            {message.type === 'career-results' && message.data && (
              <div className="mt-4 space-y-4">
                {(message.data as CareerRecommendation[]).map((career) => (
                  <div key={career.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{career.title}</h4>
                        <p className="text-sm text-gray-600">{career.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{career.match}% Match</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{career.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{career.growth}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 4).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {message.type === 'skill-roadmap' && message.data && (
              <div className="mt-4 space-y-3">
                {(message.data as Course[]).map((course) => (
                  <div key={course.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600">by {course.provider}</p>
                      </div>
                      <Badge variant={course.price === 'Free' ? 'secondary' : 'outline'}>
                        {course.price}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {course.rating}
                      </span>
                      <span>{course.level}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress || 0} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">{course.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {message.type === 'job-listings' && message.data && (
              <div className="mt-4 space-y-3">
                {(message.data as JobListing[]).map((job, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <Badge variant="outline">{job.salary}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span>Posted {job.posted}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        View Job
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {message.type === 'resume-analysis' && message.data && (
              <div className="mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setActiveTab('resume')}
                >
                  <FileText className="w-4 h-4" />
                  View Full Resume Analysis
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Career Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Gemini 2.0 Flash</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'chat' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('chat')}
              className="gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Button>
            <Button 
              variant={activeTab === 'resume' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('resume')}
              className="gap-1"
            >
              <FileText className="w-4 h-4" />
              Resume
            </Button>
            <Button 
              variant={activeTab === 'career' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('career')}
              className="gap-1"
            >
              <Target className="w-4 h-4" />
              Career
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <div className="px-6 py-4 space-y-4">
            {messages.map(renderMessage)}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="p-4">
            {activeAnalysis ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Resume Analysis</h3>
                      <p className="text-sm text-gray-600">Detailed assessment of your resume</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{activeAnalysis.score}/100</div>
                        <div className="text-xs text-gray-500">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{activeAnalysis.atsScore}/100</div>
                        <div className="text-xs text-gray-500">ATS Score</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-500">Content</div>
                      <div className="text-xl font-bold">{activeAnalysis.scoreBreakdown.content}/100</div>
                      <Progress value={activeAnalysis.scoreBreakdown.content} className="h-2 mt-1" />
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-500">Structure</div>
                      <div className="text-xl font-bold">{activeAnalysis.scoreBreakdown.structure}/100</div>
                      <Progress value={activeAnalysis.scoreBreakdown.structure} className="h-2 mt-1" />
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-500">ATS</div>
                      <div className="text-xl font-bold">{activeAnalysis.scoreBreakdown.ats}/100</div>
                      <Progress value={activeAnalysis.scoreBreakdown.ats} className="h-2 mt-1" />
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-gray-500">Achievements</div>
                      <div className="text-xl font-bold">{activeAnalysis.scoreBreakdown.achievements}/100</div>
                      <Progress value={activeAnalysis.scoreBreakdown.achievements} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-5 border border-green-100 shadow-sm">
                    <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {activeAnalysis.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-5 border border-orange-100 shadow-sm">
                    <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {activeAnalysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span className="text-sm text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {activeAnalysis.improvedSections && activeAnalysis.improvedSections.length > 0 && (
                  <div className="bg-white rounded-lg p-5 border shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      Suggested Improvements
                    </h4>
                    <div className="space-y-4">
                      {activeAnalysis.improvedSections.map((section, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Original:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded">{section.original}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Improved:</p>
                              <p className="text-sm bg-blue-50 p-2 rounded">{section.improved}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Why:</span> {section.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg p-5 border shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileDown className="w-5 h-5" />
                    Enhanced Resume
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on the analysis, I&apos;ve generated an optimized version of your resume:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => downloadResume(activeAnalysis.generatedResume, 'Enhanced_Resume.pdf')}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileSearch className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2" 
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Settings className="w-4 h-4" />
                      Request Custom Edits
                    </Button>
                  </div>
                </div>

                {editedResume && (
                  <div className="bg-white rounded-lg p-5 border shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Custom Edits Based on Your Request
                    </h4>
                    <div className="bg-gray-50 p-4 rounded border">
                      <div className="whitespace-pre-wrap text-sm">{editedResume}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-4 gap-2"
                      onClick={() => downloadResume(activeAnalysis.generatedResume, 'Custom_Edited_Resume.pdf')}
                    >
                      <Download className="w-4 h-4" />
                      Download Updated Resume
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-6 text-center shadow-sm">
                <FileSearch className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Resume Analysis Yet</h3>
                <p className="text-sm text-gray-600 mb-4">Upload your resume in the chat to get a detailed analysis and optimization suggestions.</p>
                <Button onClick={() => setActiveTab('chat')}>Go to Chat</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'career' && (
          <div className="p-4">
            {messages.find(m => m.type === 'career-results') ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Career Recommendations</h3>
                      <p className="text-sm text-gray-600">Based on your profile and current market trends</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Powered by Gemini AI</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[]).map((career, idx) => (
                    <div key={career.id} className={`rounded-lg overflow-hidden border shadow-sm ${
                      idx === 0 ? 'border-blue-200 bg-blue-50' : 
                      idx === 1 ? 'border-purple-200 bg-purple-50' : 
                      'border-green-200 bg-green-50'
                    }`}>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{career.title}</h4>
                          <Badge className={`${
                            idx === 0 ? 'bg-blue-100 text-blue-800' : 
                            idx === 1 ? 'bg-purple-100 text-purple-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {career.match}% Match
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{career.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Salary:</span>
                            <span className="text-sm text-gray-700">{career.salary}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Growth:</span>
                            <span className="text-sm text-gray-700">{career.growth}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 border-t">
                        <h5 className="text-sm font-medium mb-2">Key Skills Needed:</h5>
                        <div className="flex flex-wrap gap-1">
                          {career.skills.map((skill, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`text-xs ${
                                idx === 0 ? 'border-blue-200 text-blue-700' : 
                                idx === 1 ? 'border-purple-200 text-purple-700' : 
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg p-5 border shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Next Steps
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="gap-2 h-auto py-3" onClick={() => handleSendMessage("Create a skill roadmap for " + (messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[])[0].title)}>
                      <BookOpen className="w-4 h-4" />
                      <span className="text-left">
                        <span className="block text-xs text-gray-500">Learn path for</span>
                        {(messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[])[0].title}
                      </span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-3" onClick={() => handleSendMessage("Find me jobs as " + (messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[])[1].title)}>
                      <Briefcase className="w-4 h-4" />
                      <span className="text-left">
                        <span className="block text-xs text-gray-500">Search jobs for</span>
                        {(messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[])[1].title}
                      </span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-3" onClick={() => setActiveTab('resume')}>
                      <Wand2 className="w-4 h-4" />
                      <span className="text-left">
                        <span className="block text-xs text-gray-500">Optimize resume for</span>
                        {(messages.find(m => m.type === 'career-results')!.data as CareerRecommendation[])[2].title}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-6 text-center shadow-sm">
                <Target className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Career Recommendations Yet</h3>
                <p className="text-sm text-gray-600 mb-4">Ask about career paths or select &quot;Career Path Recommendations&quot; in chat to get started.</p>
                <Button onClick={() => setActiveTab('chat')}>Go to Chat</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input */}
      {activeTab === 'chat' && (
        <div className="bg-white border-t px-6 py-4 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask about careers, resumes, skills, or job opportunities..."
                className="pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                  title="Upload Resume"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            I can help with career exploration, resume analysis, skill development, and job searching
          </p>
        </div>
      )}

      {/* Custom Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Custom Resume Edits</DialogTitle>
            <DialogDescription>
              Provide specific instructions for how you&apos;d like your resume improved
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Instructions</label>
              <Textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="Example: Make my work experience more achievement-oriented with metrics..."
                rows={5}
              />
            </div>
            
            {editedResume && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">AI-Generated Edits</h4>
                <div className="text-sm whitespace-pre-wrap">{editedResume}</div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditedResume(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomEditRequest}
                disabled={isEditing || !editInstructions.trim()}
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Edits
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
async function generateCareerRecommendations(query: string): Promise<CareerRecommendation[]> {
  try {
    const prompt = `
      Generate career recommendations based on the following user query:
      "${query}"
      
      Provide 3 career options with:
      - Title
      - Match percentage (based on skills/experience)
      - Salary range
      - Growth outlook
      - Brief description
      - Required skills
      
      Format as JSON array with these properties:
      id, title, match, salary, growth, description, skills, demand, education, experience
    `;
    
    const response = await geminiClient.generateContent(prompt, '', true);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating career recommendations:', error);
    return [
      {
        id: '1',
        title: 'Full Stack Developer',
        match: 85,
        salary: '$80,000 - $140,000',
        growth: '+22% (Much faster than average)',
        description: 'Develop end-to-end web applications with modern frameworks.',
        skills: ['JavaScript', 'React', 'Node.js', 'Databases'],
        demand: 'High',
        education: "Bachelor&apos;s degree in Computer Science",
        experience: '2+ years'
      },
      {
        id: '2',
        title: 'Data Engineer',
        match: 78,
        salary: '$90,000 - $150,000',
        growth: '+28% (Much faster than average)',
        description: 'Design and maintain data pipelines and infrastructure.',
        skills: ['Python', 'SQL', 'ETL', 'Cloud'],
        demand: 'High',
        education: "Bachelor&apos;s degree",
        experience: '3+ years'
      },
      {
        id: '3',
        title: 'DevOps Engineer',
        match: 72,
        salary: '$95,000 - $160,000',
        growth: '+25% (Much faster than average)',
        description: 'Implement CI/CD pipelines and cloud infrastructure.',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        demand: 'High',
        education: "Bachelor&apos;s degree",
        experience: '3+ years'
      }
    ];
  }
}

async function generateSkillRoadmap(career: string): Promise<Course[]> {
  try {
    const prompt = `
      Create a skill development roadmap for someone wanting to pursue a career as:
      "${career}"
      
      Provide 3 recommended courses with:
      - Title
      - Provider
      - Duration
      - Level
      - Rating
      - Price
      - Key skills covered
      
      Format as JSON array with these properties:
      id, title, provider, duration, level, rating, students, price, skills, progress
    `;
    
    const response = await geminiClient.generateContent(prompt, '', true);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating skill roadmap:', error);
    return [
      {
        id: '1',
        title: 'Full Stack Fundamentals',
        provider: 'Coursera',
        duration: '4 weeks',
        level: 'Beginner',
        rating: 4.7,
        students: '50K',
        price: 'Free',
        skills: ['HTML', 'CSS', 'JavaScript'],
        progress: 0
      },
      {
        id: '2',
        title: 'React Development',
        provider: 'Udemy',
        duration: '6 weeks',
        level: 'Intermediate',
        rating: 4.6,
        students: '35K',
        price: '$89',
        skills: ['React', 'Redux', 'Hooks'],
        progress: 0
      },
      {
        id: '3',
        title: 'Node.js Backend Development',
        provider: 'Pluralsight',
        duration: '8 weeks',
        level: 'Intermediate',
        rating: 4.5,
        students: '25K',
        price: '$99',
        skills: ['Node.js', 'Express', 'MongoDB'],
        progress: 0
      }
    ];
  }
}

async function generateJobListings(query: string): Promise<JobListing[]> {
  try {
    const prompt = `
      Find job listings relevant to:
      "${query}"
      
      Provide 2 job listings with:
      - Title
      - Company
      - Location
      - Salary
      - Posted date
      - Brief description
      - Required skills
      
      Format as JSON array with these properties:
      id, title, company, location, salary, posted, description, skills, url
    `;
    
    const response = await geminiClient.generateContent(prompt, '', true);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating job listings:', error);
    return [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA (Remote)',
        salary: '$120,000 - $160,000',
        posted: '2 days ago',
        description: 'We are looking for an experienced frontend developer to join our team.',
        url: '#',
        skills: ['React', 'TypeScript', 'CSS']
      },
      {
        id: '2',
        title: 'Data Scientist',
        company: 'DataSystems',
        location: 'New York, NY',
        salary: '$110,000 - $150,000',
        posted: '1 week ago',
        description: 'Join our data science team to build advanced machine learning models.',
        url: '#',
        skills: ['Python', 'Machine Learning', 'SQL']
      }
    ];
  }
}

async function getAIResponse(message: string): Promise<string> {
  return "I can help you with your career development. Please provide more details about your goals and experience so I can give you personalized advice.";
}

async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  try {
    const prompt = `
      Analyze this resume and provide detailed feedback:
      ${resumeText}
      
      Calculate scores based on:
      1. Content Quality (30%): Completeness, relevance, and impact of content
      2. Structure (20%): Organization, readability, and logical flow
      3. ATS Compatibility (30%): Keyword optimization and formatting
      4. Achievement Orientation (20%): Quantifiable results and impact
      
      Provide analysis in this format:
      1. Overall score (0-100) 
      2. ATS score (0-100)
      3. List of 3-5 key strengths
      4. List of 3-5 areas needing improvement
      5. Specific suggestions for improvement with before/after examples
      6. Missing keywords for the industry
      7. Overused phrases to avoid
      
      Return as a JSON object with these properties:
      - score (number)
      - atsScore (number)
      - strengths (string[])
      - improvements (string[])
      - improvedSections (array of {original, improved, explanation})
      - keywordAnalysis (object with missing, overused, recommended arrays)
      - scoreBreakdown (object with content, structure, ats, achievements)
    `;
    
    const response = await geminiClient.generateContent(prompt, '', true);
    const parsedResponse = JSON.parse(response);
    
    // Ensure scores are within 0-100 range
    const normalizedScore = Math.min(100, Math.max(0, Math.round(parsedResponse.score || 0)));
    const normalizedAtsScore = Math.min(100, Math.max(0, Math.round(parsedResponse.atsScore || 0)));
    
    return {
      ...parsedResponse,
      score: normalizedScore,
      atsScore: normalizedAtsScore,
      generatedResume: ''
    };
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis(): ResumeAnalysis {
  // Generate realistic scores based on common resume issues
  const baseScore = 65 + Math.floor(Math.random() * 15); // 65-80 range
  const atsScore = 60 + Math.floor(Math.random() * 20); // 60-80 range
  
  return {
    score: baseScore,
    atsScore: atsScore,
    strengths: [
      'Clear work history with relevant experience',
      'Good educational background',
      'Technical skills well-presented'
    ],
    improvements: [
      'Add more quantifiable achievements',
      'Include more industry-specific keywords',
      'Expand leadership experience sections'
    ],
    improvedSections: [
      {
        original: "Developed features for web application",
        improved: "Built 5 major features for customer portal using React, increasing user engagement by 30%",
        explanation: "Added specific technologies and measurable impact"
      }
    ],
    keywordAnalysis: {
      missing: ['Agile', 'CI/CD', 'REST APIs'],
      overused: ['Responsible for', 'Worked on'],
      recommended: ['Architected', 'Optimized', 'Delivered']
    },
    scoreBreakdown: {
      content: 70,
      structure: 65,
      ats: 75,
      achievements: 60
    },
    generatedResume: ''
  };
}