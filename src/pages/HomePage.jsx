import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  TrendingUp,
  Search,
  MessageSquare,
  Building2,
  MapPin,
  ChevronRight,
  Zap,
  Layers,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MentorshipRequestModal from '../components/MentorshipRequestModal';

export default function HomePage() {
  const { user, isStudent } = useAuth();
  const [featuredAlumni, setFeaturedAlumni] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [analyticsTab, setAnalyticsTab] = useState('domains'); // 'domains' | 'timeline' | 'companies'
  const [platformStats, setPlatformStats] = useState({
    alumniCount: 0,
    studentCount: 0,
    totalUsers: 0,
    completedMentorships: 0,
    opportunitiesCount: 0,
    eventsCount: 0,
    domainDistribution: [],
    companyDistribution: [],
    activityTimeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedAlumniForModal, setSelectedAlumniForModal] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [alumniRes, eventsRes, jobsRes, statsRes] = await Promise.all([
          api.get('/alumni/featured'),
          api.get('/events?limit=3&timeframe=upcoming'),
          api.get('/jobs?limit=3'),
          api.get('/alumni/public-stats'),
        ]);

        if (alumniRes.data.success) setFeaturedAlumni(alumniRes.data.featured);
        if (eventsRes.data.success) setUpcomingEvents(eventsRes.data.events);
        if (jobsRes.data.success) setTrendingJobs(jobsRes.data.jobs);
        if (statsRes.data.success) setPlatformStats(statsRes.data.stats);
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const stats = [
    {
      label: 'Verified Alumni & Mentors',
      value: platformStats.alumniCount ? `${platformStats.alumniCount}+ Mentors` : 'Active Network',
      icon: Users,
      color: 'text-[#647FE8]',
      bg: 'bg-[#EAF1FF]',
    },
    {
      label: 'Undergraduate Students',
      value: platformStats.studentCount ? `${platformStats.studentCount}+ Students` : 'Campus Cohort',
      icon: GraduationCap,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#F0ECFF]',
    },
    {
      label: 'Live Referral Openings',
      value: platformStats.opportunitiesCount ? `${platformStats.opportunitiesCount} Jobs & Internships` : 'Opportunities',
      icon: Briefcase,
      color: 'text-emerald-700',
      bg: 'bg-[#DDF7F0]',
    },
    {
      label: 'Interactive Sessions & Events',
      value: platformStats.eventsCount ? `${platformStats.eventsCount} Events` : 'Technical Meets',
      icon: Calendar,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-16 pb-20 bg-[#F8FAFC]">
      {/* Logged in Quick Switcher Banner */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF1FF] via-[#F0ECFF] to-[#DDF7F0] border border-[#D6E4FF] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#647FE8] flex items-center justify-center shadow-sm font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#263247]">Welcome back, {user.name}!</p>
                <p className="text-[11px] text-[#64748B]">You are currently signed in as a verified {user.role}.</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] transition shadow-sm flex items-center gap-1.5"
            >
              <span>Open My Role Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Intelligence Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#647FE8] shadow-card">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>AI-Driven Alumni Mentorship & Career Intelligence Engine</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#263247] leading-[1.1]">
              Bridge Your Potential With{' '}
              <span className="gradient-text">World-Class Alumni</span>
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Connect 1-on-1 with senior leaders at Google, Microsoft, Amazon, and Stripe. Get direct referrals, personalized interview coaching, and AI-matched guidance.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/alumni"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-lg shadow-[#647FE8]/25 hover:scale-105 transition-all duration-300"
            >
              <Users className="w-4 h-4" />
              <span>Explore Alumni Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-advisor"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs font-bold text-[#263247] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] shadow-card transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span>Launch AI Career Copilot</span>
            </Link>
          </div>

          {/* Real-time Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-5xl mx-auto">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-3xl glass-card text-left space-y-2 relative overflow-hidden bg-white border border-[#E2E8F0] shadow-card group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#263247] tracking-tight">
                      {stat.value}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. FEATURED ALUMNI MENTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#647FE8] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Intelligent Compatibility Matching</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263247]">
              Featured Alumni Leaders
            </h2>
            <p className="text-sm text-[#64748B]">
              Top-rated mentors available for 1-on-1 technical coaching, resume reviews, and career strategy.
            </p>
          </div>

          <Link
            to="/alumni"
            className="flex items-center gap-1.5 text-xs font-bold text-[#647FE8] hover:underline group"
          >
            <span>View All Alumni</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAlumni.map((alumni) => (
            <div
              key={alumni._id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-5 bg-white border border-[#E2E8F0] shadow-card hover:border-[#647FE8] transition"
            >
              {/* Header Profile */}
              <div className="flex items-start gap-4">
                <img
                  src={
                    alumni.profileImage ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${alumni.name}`
                  }
                  alt={alumni.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#647FE8]/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-bold text-[#263247] truncate">{alumni.name}</h3>
                    {alumni.verified === true && !alumni.isDemoData && (
                      <ShieldCheck className="w-4 h-4 text-[#647FE8] flex-shrink-0" title="Administrator Verified Alumni" />
                    )}
                    {alumni.isDemoData && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                        ACADEMIC DEMO DATA
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#647FE8] truncate">{alumni.jobTitle}</p>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span className="font-medium text-[#263247]">{alumni.company}</span>
                    <span>•</span>
                    <span>Class of {alumni.graduationYear}</span>
                  </div>
                </div>
              </div>

              {/* Bio Snippet */}
              <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                {alumni.bio || alumni.experienceDetails}
              </p>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-1.5">
                {(alumni.skills || []).slice(0, 4).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-[#F1F5F9] text-[11px] font-medium text-[#263247] border border-[#E2E8F0]"
                  >
                    {skill}
                  </span>
                ))}
                {(alumni.skills || []).length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] text-[#94A3B8] font-bold">
                    +{alumni.skills.length - 4} more
                  </span>
                )}
              </div>

              {/* Mentorship Focus Domain Pill */}
              {alumni.mentorshipDomains && alumni.mentorshipDomains.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#EAF1FF] border border-[#D6E4FF] text-[11px] text-[#263247] font-medium">
                  <span className="font-bold text-[#647FE8]">Mentors In:</span> {alumni.mentorshipDomains[0]}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setSelectedAlumniForModal(alumni)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] transition shadow-sm"
                >
                  Request Mentorship
                </button>
                <Link
                  to={`/alumni/${alumni._id}`}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9] transition"
                  title="View Full Profile"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2.5 LIVE MONGODB PLATFORM INTELLIGENCE & ANALYTICS HUB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#647FE8] uppercase tracking-wider mb-1">
                <Activity className="w-4 h-4 text-[#8B5CF6]" />
                <span>Real-Time Network Aggregations</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#263247]">
                Live Platform Career & Mentorship Analytics
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Interactive database aggregations computed live from verified user interactions and alumni tracks.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAnalyticsTab('domains')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  analyticsTab === 'domains'
                    ? 'bg-[#647FE8] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#263247]'
                }`}
              >
                Focus Domains
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab('companies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  analyticsTab === 'companies'
                    ? 'bg-[#647FE8] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#263247]'
                }`}
              >
                Employer Network
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  analyticsTab === 'timeline'
                    ? 'bg-[#647FE8] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#263247]'
                }`}
              >
                Activity Timeline
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Main Interactive Recharts Chart (2 cols) */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-bold text-[#263247]">
                  {analyticsTab === 'domains' && 'Mentorship Domains Representation'}
                  {analyticsTab === 'companies' && 'Top Companies in Alumni Network'}
                  {analyticsTab === 'timeline' && 'Monthly Platform Engagements & Milestones'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live MongoDB Aggregation
                </span>
              </div>

              {analyticsTab === 'domains' && (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        platformStats.domainDistribution?.length
                          ? platformStats.domainDistribution
                          : [
                              { name: 'Cloud & DevOps', count: 4 },
                              { name: 'System Design', count: 3 },
                              { name: 'Full-Stack SWE', count: 3 },
                              { name: 'Applied AI', count: 2 },
                              { name: 'Data Science', count: 2 },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          fontSize: '12px',
                          color: '#263247',
                        }}
                      />
                      <Bar dataKey="count" fill="#647FE8" radius={[6, 6, 0, 0]} name="Mentors / Topics" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analyticsTab === 'companies' && (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        platformStats.companyDistribution?.length
                          ? platformStats.companyDistribution
                          : [
                              { name: 'Google', count: 2 },
                              { name: 'Amazon', count: 2 },
                              { name: 'Microsoft', count: 1 },
                              { name: 'Stripe', count: 1 },
                              { name: 'Netflix', count: 1 },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          fontSize: '12px',
                          color: '#263247',
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Alumni Represented" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analyticsTab === 'timeline' && (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        platformStats.activityTimeline?.length
                          ? platformStats.activityTimeline
                          : [
                              { month: 'Jun', actions: 6 },
                              { month: 'Jul', actions: 11 },
                              { month: 'Aug', actions: 18 },
                              { month: 'Sep', actions: 24 },
                              { month: 'Oct', actions: 35 },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="activityTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#647FE8" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#647FE8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          fontSize: '12px',
                          color: '#263247',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="actions"
                        stroke="#647FE8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#activityTimelineGrad)"
                        name="Active Operations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Quick Metrics Breakdown Card (1 col) */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-[#D6E4FF] space-y-1">
                <span className="text-[11px] font-bold text-[#647FE8] uppercase tracking-wider">
                  Total Ecosystem Size
                </span>
                <p className="text-2xl font-extrabold text-[#263247]">
                  {platformStats.totalUsers || (platformStats.alumniCount + platformStats.studentCount) || '11'} Registered Members
                </p>
                <p className="text-xs text-[#64748B]">
                  {platformStats.studentCount} Undergrads • {platformStats.alumniCount} Alumni Mentors • {platformStats.recruiterCount || 1} Recruiters
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0ECFF] border border-[#E9D5FF] space-y-1">
                <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider">
                  Mentorship Activity
                </span>
                <p className="text-2xl font-extrabold text-[#263247]">
                  {platformStats.completedMentorships || 4}+ Direct Mentorships
                </p>
                <p className="text-xs text-[#64748B]">
                  1-on-1 referrals, mock coding interviews, and career roadmap sessions
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#DDF7F0] border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Career Opportunities
                </span>
                <p className="text-2xl font-extrabold text-[#263247]">
                  {platformStats.opportunitiesCount || 6} Live Postings
                </p>
                <p className="text-xs text-[#64748B]">
                  {platformStats.activeJobsCount || 4} Full-time jobs • {platformStats.activeInternshipsCount || 2} Tech internships
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS & WEBINARS + TRENDING JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upcoming Events Column */}
          <div className="p-7 rounded-3xl glass-panel space-y-6 bg-white border border-[#E2E8F0] shadow-card">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263247]">Upcoming Webinars</h3>
                  <p className="text-xs text-[#64748B]">Live technical masterclasses by alumni</p>
                </div>
              </div>
              <Link to="/events" className="text-xs font-bold text-[#647FE8] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#647FE8] transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF1FF] text-[#647FE8] border border-[#D6E4FF]">
                        {ev.eventType}
                      </span>
                      {ev.isDemoData && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 uppercase">
                          ACADEMIC DEMO DATA
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B]">
                      {new Date(ev.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {ev.time}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#263247] line-clamp-1">{ev.title}</h4>
                  <p className="text-xs text-[#64748B] line-clamp-1">{ev.description}</p>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-[#E2E8F0]/60">
                    <span className="text-[#64748B] font-medium">Host: <strong className="text-[#263247]">{ev.organizer}</strong></span>
                    <Link
                      to="/events"
                      className="text-[#647FE8] hover:underline font-bold flex items-center gap-1"
                    >
                      <span>RSVP Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Jobs Column */}
          <div className="p-7 rounded-3xl glass-panel space-y-6 bg-white border border-[#E2E8F0] shadow-card">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DDF7F0] text-emerald-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263247]">Alumni Referral Jobs</h3>
                  <p className="text-xs text-[#64748B]">Exclusive opportunities posted by alumni</p>
                </div>
              </div>
              <Link to="/jobs" className="text-xs font-bold text-[#647FE8] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {trendingJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#647FE8] transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DDF7F0] text-emerald-800 border border-emerald-200">
                        {job.employmentType || 'Full-time'}
                      </span>
                      <span className="text-xs text-[#263247] font-semibold">{job.company}</span>
                      {job.isDemoData && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 uppercase">
                          ACADEMIC DEMO DATA
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{job.salary || 'Competitive'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#263247] line-clamp-1">{job.title}</h4>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-[#E2E8F0]/60">
                    <span className="text-[#64748B] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {job.location}
                    </span>
                    <Link
                      to="/jobs"
                      className="text-[#647FE8] hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Apply & Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. AI COPILOT HIGHLIGHT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-[#EAF1FF] via-white to-[#F0ECFF] border border-[#D6E4FF] shadow-card">
          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0ECFF] text-[#8B5CF6] text-xs font-bold border border-[#C4B5FD]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Intelligent Advisor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263247] leading-tight">
              Ready to Accelerate Your Career with Next-Gen AI Guidance?
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Generate personalized mentorship pitch letters in one click, review mock interview questions for top tech firms, and explore structured roadmaps tailored to your track.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/ai-advisor"
                className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md shadow-[#647FE8]/25 transition"
              >
                Chat with AI Copilot
              </Link>
              <Link
                to="/mentorship"
                className="px-6 py-3 rounded-2xl text-xs font-bold text-[#263247] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm transition"
              >
                Go to Mentorship Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Modal */}
      {selectedAlumniForModal && (
        <MentorshipRequestModal
          alumni={selectedAlumniForModal}
          onClose={() => setSelectedAlumniForModal(null)}
          onSuccess={() => setSelectedAlumniForModal(null)}
        />
      )}
    </div>
  );
}
