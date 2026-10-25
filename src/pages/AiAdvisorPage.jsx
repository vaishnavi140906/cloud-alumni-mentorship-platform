import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Compass,
  Code2,
  Cpu,
  Cloud,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AiAdvisorPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('chat'); // 'chat' | 'roadmaps' | 'questions'
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user ? user.name : 'there'}! I am **AlumniAI**, your virtual career copilot. I can help you draft compelling mentorship outreach letters, critique your resume for ATS standards, prepare for system design & coding interviews, and navigate career roadmaps across Google, Microsoft, AWS, and Stripe alumni tracks. How can I assist your journey today?`,
      actionSuggestions: [
        'Resume tips for Google & Tier-1 firms',
        'How to prepare for System Design interviews',
        'Machine Learning Engineer Roadmap',
        'DevOps & Cloud Architect Roadmap',
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const messagesEndRef = useRef(null);

  // Roadmap state
  const [selectedTrack, setSelectedTrack] = useState('software-engineering');
  const [roadmapData, setRoadmapData] = useState(null);

  // Interview Questions state
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState('swe');
  const [interviewQuestions, setInterviewQuestions] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load Roadmap
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get(`/ai/roadmaps/${selectedTrack}`);
        if (res.data.success) {
          setRoadmapData(res.data.roadmap);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoadmap();
  }, [selectedTrack]);

  // Load Interview questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/ai/interview-bank/${selectedQuestionCategory}`);
        if (res.data.success) {
          setInterviewQuestions(res.data.questions);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, [selectedQuestionCategory]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setLoadingAdvice(true);

    try {
      const res = await api.post('/ai/advise', { query });
      if (res.data.success) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.advice.response,
          category: res.data.advice.category,
          actionSuggestions: res.data.advice.actionSuggestions,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am here to guide you. Feel free to ask about resume building, technical interview preparation, or connecting with alumni mentors in our directory!',
        },
      ]);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8FAFC]">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#F0ECFF] via-white to-[#EAF1FF] border border-[#D6E4FF] shadow-card relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          <span>Intelligent Career Copilot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
          AlumniAI Career & Mentorship Advisor
        </h1>
        <p className="text-sm text-[#64748B] max-w-2xl">
          AI assistant powered by career data, mock interview questions, ATS guidelines, and university alumni tracks.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveSection('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSection === 'chat'
              ? 'bg-[#F0ECFF] text-[#8B5CF6] border border-[#C4B5FD] shadow-sm'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Interactive AI Copilot</span>
        </button>

        <button
          onClick={() => setActiveSection('roadmaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSection === 'roadmaps'
              ? 'bg-[#F0ECFF] text-[#8B5CF6] border border-[#C4B5FD] shadow-sm'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Industry Career Roadmaps</span>
        </button>

        <button
          onClick={() => setActiveSection('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSection === 'questions'
              ? 'bg-[#F0ECFF] text-[#8B5CF6] border border-[#C4B5FD] shadow-sm'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Mock Technical Questions</span>
        </button>
      </div>

      {/* Section 1: Chat Copilot */}
      {activeSection === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Stream (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl bg-white shadow-card flex flex-col h-[640px] border border-[#E2E8F0] overflow-hidden">
            
            {/* Chat header */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#8B5CF6]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#263247]">AlumniAI Assistant</h3>
                <p className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online & Ready to Advise
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-[#647FE8] text-white'
                        : 'bg-[#8B5CF6] text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#647FE8] text-white font-medium shadow-sm'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#263247]'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Action suggestions pills */}
                    {msg.actionSuggestions && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#E2E8F0]">
                        {msg.actionSuggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-[#F1F5F9] text-[#647FE8] border border-[#CBD5E1] transition shadow-xs"
                          >
                            👉 {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingAdvice && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] text-[#8B5CF6] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
                    AlumniAI is formulating strategic guidance...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about resume tips, interview prep, FAANG roadmaps, or draft outreach letters..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8]"
              />
              <button
                type="submit"
                disabled={loadingAdvice || !inputQuery.trim()}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Quick Guidance Sidebar (1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-3">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Popular Career Prompts</span>
              </h4>
              <div className="space-y-2">
                {[
                  'How do I structure Google SWE resume bullets?',
                  'What are key system design topics for 2026?',
                  'How to prepare for Azure / AWS certifications?',
                  'Draft a cold outreach message to an engineering director',
                  'What is the difference between RAG and fine-tuning in ML?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs text-[#263247] transition font-medium"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Section 2: Career Roadmaps */}
      {activeSection === 'roadmaps' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'software-engineering', label: 'Full-Stack & Cloud SWE' },
              { id: 'ai-machine-learning', label: 'Applied AI & ML Engineer' },
              { id: 'cloud-devops', label: 'Cloud & DevOps Architect' },
              { id: 'product-management', label: 'Technical Product Management' },
            ].map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedTrack === track.id
                    ? 'bg-[#F0ECFF] text-[#8B5CF6] border border-[#C4B5FD] shadow-sm'
                    : 'bg-white text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>

          {roadmapData && (
            <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-6">
              <h3 className="text-xl font-extrabold text-[#263247]">{roadmapData.title}</h3>
              
              <div className="relative border-l-2 border-[#E2E8F0] ml-4 space-y-6 pl-6">
                {roadmapData.steps.map((step, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center shadow-md shadow-[#8B5CF6]/30">
                      {step.step}
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                      <h4 className="text-sm font-bold text-[#263247] group-hover:text-[#8B5CF6] transition">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Mock Questions */}
      {activeSection === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'swe', label: 'Software & Distributed Systems' },
              { id: 'ml', label: 'Machine Learning & LLMs' },
              { id: 'general', label: 'Behavioral & Leadership (STAR)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedQuestionCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedQuestionCategory === cat.id
                    ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#D6E4FF] shadow-sm'
                    : 'bg-white text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {interviewQuestions.map((q, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card flex items-start gap-4 hover:border-[#647FE8] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EAF1FF] text-[#647FE8] font-bold text-xs flex items-center justify-center flex-shrink-0">
                  Q{i + 1}
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-bold text-[#263247]">{q}</p>
                  <button
                    onClick={() => {
                      setActiveSection('chat');
                      handleSendMessage(`How would you approach answering this technical interview question: "${q}"?`);
                    }}
                    className="text-xs font-bold text-[#647FE8] hover:underline flex items-center gap-1"
                  >
                    <span>Ask AlumniAI for Model Answer Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
