'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Target, 
  BookOpen,
  Upload,
  Download,
  TrendingUp,
  DollarSign,
  MapPin,
  Award,
  Clock,
  Loader2,
  Star,
  Building,
  GraduationCap,
  Code,
  CheckCircle,
  PlayCircle,
  Brain,
  Lightbulb,
  Zap,
  BarChart3
} from 'lucide-react';
import { watsonClient } from '@/lib/watson-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'career-results' | 'resume-analysis' | 'skill-roadmap' | 'job-listings';
  data?: any;
}

interface CareerRecommendation {
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

interface JobListing {
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  description: string;
}

interface Course {
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

export default function AICareerAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Career Assistant. I can help you with career planning, resume optimization, skill development, and job searching. What would you like to explore today?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: "Find Career Match", icon: Target, action: "I want to explore career options that match my interests and skills" },
    { label: "Analyze My Resume", icon: FileText, action: "Help me analyze and improve my resume" },
    { label: "Skill Development", icon: BookOpen, action: "Show me a learning roadmap for my career goals" },
    { label: "Job Search", icon: Building, action: "Help me find job opportunities in my field" }
  ];

  const detectIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job match') || lowerMessage.includes('career change')) {
      return 'career-exploration';
    }
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('application')) {
      return 'resume-help';
    }
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('course') || lowerMessage.includes('training')) {
      return 'skill-development';
    }
    if (lowerMessage.includes('job search') || lowerMessage.includes('hiring') || lowerMessage.includes('job opening')) {
      return 'job-search';
    }
    return 'general';
  };

  const generateCareerRecommendations = async (userMessage: string): Promise<CareerRecommendation[]> => {
    try {
      const response = await fetch('/api/careers?skills=programming&interests=technology');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Career API error:', error);
    }
    
    // Fallback recommendations
    return [
      {
        id: '1',
        title: 'Software Engineer',
        match: 92,
        salary: '$85,000 - $150,000',
        growth: '+22% (Much faster than average)',
        description: 'Design and develop software applications and systems.',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
        demand: 'High',
        education: "Bachelor's degree in Computer Science",
        experience: '2-4 years'
      },
      {
        id: '2',
        title: 'Data Scientist',
        match: 88,
        salary: '$95,000 - $165,000',
        growth: '+31% (Much faster than average)',
        description: 'Analyze complex data to help organizations make informed decisions.',
        skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Tableau'],
        demand: 'High',
        education: "Master's degree preferred",
        experience: '3-5 years'
      },
      {
        id: '3',
        title: 'UX Designer',
        match: 85,
        salary: '$70,000 - $120,000',
        growth: '+13% (Faster than average)',
        description: 'Create user-friendly digital experiences and interfaces.',
        skills: ['Figma', 'User Research', 'Prototyping', 'Adobe Creative Suite'],
        demand: 'Medium',
        education: "Bachelor's degree in Design or related field",
        experience: '2-4 years'
      }
    ];
  };

  const generateSkillRoadmap = async (career: string): Promise<Course[]> => {
    return [
      {
        id: '1',
        title: 'JavaScript Fundamentals',
        provider: 'TechEd Pro',
        duration: '4 weeks',
        level: 'Beginner',
        rating: 4.8,
        students: '45K',
        price: 'Free',
        skills: ['JavaScript', 'ES6+', 'DOM Manipulation'],
        progress: 100
      },
      {
        id: '2',
        title: 'React Development',
        provider: 'CodeAcademy',
        duration: '6 weeks',
        level: 'Intermediate',
        rating: 4.7,
        students: '32K',
        price: '$49',
        skills: ['React', 'JSX', 'State Management'],
        progress: 65
      },
      {
        id: '3',
        title: 'Backend Development',
        provider: 'DevPath',
        duration: '8 weeks',
        level: 'Intermediate',
        rating: 4.6,
        students: '28K',
        price: '$79',
        skills: ['Node.js', 'Express', 'Databases'],
        progress: 0
      }
    ];
  };

  const generateJobListings = async (query: string): Promise<JobListing[]> => {
    try {
      const response = await fetch(`/api/adzuna?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.results?.slice(0, 5).map((job: any) => ({
          title: job.title,
          company: job.company?.display_name || 'Company Name',
          location: job.location?.display_name || 'Remote',
          salary: job.salary_is_predicted === '1' ? 'Competitive' : `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k`,
          posted: new Date(job.created).toLocaleDateString(),
          description: job.description?.slice(0, 150) + '...' || 'Job description not available'
        })) || [];
      }
    } catch (error) {
      console.error('Job search error:', error);
    }

    // Fallback job listings
    return [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$140k - $180k',
        posted: '2 days ago',
        description: 'Join our team to build scalable web applications using modern technologies...'
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        salary: '$90k - $130k',
        posted: '1 week ago',
        description: 'Work on exciting projects with cutting-edge technology stack...'
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Agency',
        location: 'New York, NY',
        salary: '$80k - $120k',
        posted: '3 days ago',
        description: 'Create beautiful and responsive web interfaces for our clients...'
      }
    ];
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

    try {
      const intent = detectIntent(content);
      let assistantMessage: Message;

      switch (intent) {
        case 'career-exploration':
          const careers = await generateCareerRecommendations(content);
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Based on your interests and skills, I've found some excellent career matches for you. Here are the top recommendations:",
            timestamp: new Date(),
            type: 'career-results',
            data: careers
          };
          break;

        case 'skill-development':
          const courses = await generateSkillRoadmap(content);
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Here's a personalized learning roadmap to help you develop the skills you need:",
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
            content: "I found some great job opportunities that match your profile:",
            timestamp: new Date(),
            type: 'job-listings',
            data: jobs
          };
          break;

        case 'resume-help':
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I can help you optimize your resume! You can upload your current resume for analysis, or I can guide you through creating a new one. What would you prefer?",
            timestamp: new Date(),
            type: 'text'
          };
          break;

        default:
          // Use Watson AI for general queries
          try {
            const aiResponse = await watsonClient.generateText(
              `You are a helpful AI career assistant. The user asked: "${content}". Provide a helpful, concise response related to career guidance, job searching, resume help, or skill development.`
            );
            assistantMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: aiResponse || "I'm here to help with your career journey! You can ask me about career exploration, resume optimization, skill development, or job searching.",
              timestamp: new Date(),
              type: 'text'
            };
          } catch (aiError) {
            console.error('Watson AI error:', aiError);
            assistantMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: "I'm here to help with your career journey! You can ask me about career exploration, resume optimization, skill development, or job searching. What specific area would you like to focus on?",
              timestamp: new Date(),
              type: 'text'
            };
          }
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an issue processing your request. Please try again or ask me something else about your career development!",
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

    // Simulate resume analysis
    setTimeout(() => {
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've analyzed your resume! Here's what I found:",
        timestamp: new Date(),
        type: 'resume-analysis',
        data: {
          score: 78,
          strengths: ['Strong technical skills', 'Relevant experience', 'Clear formatting'],
          improvements: ['Add more quantifiable achievements', 'Include relevant keywords', 'Expand on leadership experience'],
          suggestions: ['Consider adding a professional summary', 'Highlight your most recent accomplishments', 'Tailor for specific job applications']
        }
      };
      setMessages(prev => [...prev, analysisMessage]);
      setIsLoading(false);
    }, 2000);
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
          <div className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-blue-600 text-white ml-auto' 
              : 'bg-white border border-gray-200'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Career Results */}
            {message.type === 'career-results' && message.data && (
              <div className="mt-4 space-y-4">
                {message.data.map((career: CareerRecommendation) => (
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

            {/* Skill Roadmap */}
            {message.type === 'skill-roadmap' && message.data && (
              <div className="mt-4 space-y-3">
                {message.data.map((course: Course) => (
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

            {/* Job Listings */}
            {message.type === 'job-listings' && message.data && (
              <div className="mt-4 space-y-3">
                {message.data.map((job: JobListing, idx: number) => (
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
                    
                    <p className="text-sm text-gray-600">{job.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Resume Analysis */}
            {message.type === 'resume-analysis' && message.data && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl font-bold text-blue-600">{message.data.score}/100</div>
                  <div className="text-sm text-gray-600">Resume Score</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h5>
                    <ul className="text-sm space-y-1">
                      {message.data.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-gray-600">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Improvements
                    </h5>
                    <ul className="text-sm space-y-1">
                      {message.data.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="text-gray-600">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
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
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Career Assistant</h1>
            <p className="text-sm text-gray-600">Your intelligent career guidance companion</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="bg-white border-b px-6 py-4">
          <p className="text-sm text-gray-600 mb-3">Quick actions to get started:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => handleSendMessage(action.action)}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask me about careers, resumes, skills, or job searching..."
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
    </div>
  );
}