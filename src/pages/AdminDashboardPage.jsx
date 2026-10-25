import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Calendar,
  Video,
  Plus,
  Edit2,
  Trash2,
  Search,
  Server,
  Cloud,
  RefreshCw,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  MapPin,
  DollarSign,
  Tag,
  Eye,
  Activity as ActivityIcon,
  Layers,
  Filter,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activities' | 'jobs' | 'internships' | 'events' | 'webinars' | 'users'
  const [stats, setStats] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interactive Chart States
  const [chartMetric, setChartMetric] = useState('all'); // 'all' | 'sessions' | 'registrations' | 'jobs'
  const [dateRange, setDateRange] = useState('6m'); // '6m' | '3m' | '1m'

  // Activity Stream States
  const [activities, setActivities] = useState([]);
  const [activityCategory, setActivityCategory] = useState('All');
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTotal, setActivityTotal] = useState(0);

  // Data lists
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [events, setEvents] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Search & Filter state for tables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Modal Form States
  const [modalType, setModalType] = useState(null); // 'job' | 'internship' | 'event' | 'webinar' | null
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // View Details Modal State
  const [viewItem, setViewItem] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes, jobsRes, internshipsRes, eventsRes, webinarsRes, usersRes] =
        await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/health'),
          api.get('/jobs?limit=100'),
          api.get('/internships?limit=100'),
          api.get('/events?limit=100'),
          api.get('/webinars?limit=100'),
          api.get('/admin/users'),
        ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (healthRes.data.success) setHealthData(healthRes.data.health);
      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (internshipsRes.data.success) setInternships(internshipsRes.data.internships);
      if (eventsRes.data.success) setEvents(eventsRes.data.events);
      if (webinarsRes.data.success) setWebinars(webinarsRes.data.webinars);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      if (activityCategory !== 'All') params.append('category', activityCategory);
      params.append('limit', '50');

      const res = await api.get(`/admin/activities?${params.toString()}`);
      if (res.data.success) {
        setActivities(res.data.activities);
        setActivityTotal(res.data.total);
      }
    } catch (err) {
      console.error('Activities fetch error:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab, activityCategory]);

  // Open Modal for Add
  const handleOpenAddModal = (type) => {
    setModalType(type);
    setIsEditing(false);
    setCurrentEditId(null);
    setFormError('');

    if (type === 'job') {
      setFormData({
        title: '',
        company: '',
        location: 'Remote / Hybrid',
        employmentType: 'Full-time',
        description: '',
        skills: '',
        salary: '$120,000 - $150,000 / year',
        experience: 'Entry Level (0-2 years)',
        applicationLink: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
      });
    } else if (type === 'internship') {
      setFormData({
        title: '',
        company: '',
        location: 'San Francisco, CA / Remote',
        internshipType: 'Summer Internship',
        description: '',
        skills: '',
        stipend: '$50 / hour',
        duration: '3 Months (Summer 2026/2027)',
        applicationLink: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
      });
    } else if (type === 'event') {
      setFormData({
        title: '',
        organizer: 'School of Computer Science & Engineering',
        eventType: 'Workshop',
        description: '',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '5:00 PM - 7:00 PM EST',
        venue: 'Auditorium Hall B / Hybrid Stream',
        registrationLink: '',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Upcoming',
      });
    } else if (type === 'webinar') {
      setFormData({
        title: '',
        organizer: 'Office of Alumni Relations & Career Growth',
        speaker: '',
        description: '',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '6:00 PM - 7:30 PM EST',
        platform: 'Zoom',
        registrationLink: '',
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Upcoming',
      });
    }
  };

  // Open Modal for Edit
  const handleOpenEditModal = (type, item) => {
    setModalType(type);
    setIsEditing(true);
    setCurrentEditId(item._id);
    setFormError('');

    setFormData({
      ...item,
      skills: Array.isArray(item.skills) ? item.skills.join(', ') : item.skills || '',
      deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
    });
  };

  // Handle Form Submission (Add / Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const endpoint = `/${modalType === 'job' ? 'jobs' : modalType === 'internship' ? 'internships' : modalType === 'event' ? 'events' : 'webinars'}`;

      const payload = {
        ...formData,
        skills:
          typeof formData.skills === 'string'
            ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : formData.skills,
      };

      if (isEditing) {
        await api.put(`${endpoint}/${currentEditId}`, payload);
        showToast(`${modalType.toUpperCase()} updated successfully in MongoDB!`);
      } else {
        await api.post(endpoint, payload);
        showToast(`New ${modalType.toUpperCase()} published and stored in MongoDB!`);
      }

      setModalType(null);
      fetchAllAdminData();
      fetchActivities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please check required fields.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete with Confirmation
  const handleDeleteItem = async (type, id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from MongoDB?`)) return;

    try {
      const endpoint = `/${type === 'job' ? 'jobs' : type === 'internship' ? 'internships' : type === 'event' ? 'events' : 'webinars'}/${id}`;
      await api.delete(endpoint);
      showToast(`${type.toUpperCase()} deleted successfully.`);
      fetchAllAdminData();
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // Toggle User Active / Verified
  const handleVerifyAlumni = async (userId, newStatus) => {
    try {
      await api.put(`/admin/verify-alumni/${userId}`, { verified: newStatus });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, verified: newStatus } : u))
      );
      showToast('Alumni verification status updated in MongoDB.');
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleToggleUserActive = async (userId, currentActive) => {
    try {
      await api.put(`/admin/user/${userId}`, { isActive: !currentActive });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
      );
      showToast('User account status updated.');
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'User status update failed');
    }
  };

  // Filter monthly data based on selected dateRange
  const getFilteredMonthlyData = () => {
    if (!stats?.monthlyActivity) return [];
    if (dateRange === '1m') return stats.monthlyActivity.slice(-1);
    if (dateRange === '3m') return stats.monthlyActivity.slice(-3);
    return stats.monthlyActivity; // default 6m
  };

  const filteredMonthlyData = getFilteredMonthlyData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-3xl glass-panel relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrative Operations & Opportunities Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Admin Command Center
            </h1>
            <p className="text-sm text-slate-300">
              Manage live MongoDB opportunities, inspect genuine user activity audit logs, and monitor platform metrics.
            </p>
          </div>

          <button
            onClick={() => {
              fetchAllAdminData();
              fetchActivities();
              showToast('Refreshed data from MongoDB.');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync MongoDB</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Analytics Overview', icon: Users, count: null },
          { id: 'activities', label: 'Activity Audit Stream', icon: ActivityIcon, count: activityTotal || null },
          { id: 'jobs', label: 'Manage Jobs', icon: Briefcase, count: jobs.length },
          { id: 'internships', label: 'Manage Internships', icon: Briefcase, count: internships.length },
          { id: 'events', label: 'Manage Events', icon: Calendar, count: events.length },
          { id: 'webinars', label: 'Manage Webinars', icon: Video, count: webinars.length },
          { id: 'users', label: 'Member Directory', icon: ShieldCheck, count: usersList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                setFilterType('All');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & INTERACTIVE CHARTS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-400">Total Opportunities</span>
              <div className="text-2xl font-extrabold text-white">
                {jobs.length + internships.length}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {jobs.length} Full-time • {internships.length} Internships
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-400">Events & Webinars</span>
              <div className="text-2xl font-extrabold text-white">
                {events.length + webinars.length}
              </div>
              <div className="text-[11px] text-pink-400 font-medium">
                {events.length} Events • {webinars.length} Webinars
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-400">Verified Alumni</span>
              <div className="text-2xl font-extrabold text-white">{stats.verifiedAlumni}</div>
              <div className="text-[11px] text-amber-400 font-medium">
                {stats.pendingAlumni} Pending Verification
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-400">Mentorship Sessions</span>
              <div className="text-2xl font-extrabold text-white">{stats.totalMentorships}</div>
              <div className="text-[11px] text-accent-300">
                {stats.completedMentorships} Completed • {stats.activeMentorships} Active
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <span>Platform Growth & Historical Dynamics</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Aggregated from MongoDB records across 6 months
                </p>
              </div>

              {/* Metric & Timeframe Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric Selector Pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {[
                    { id: 'all', label: 'All Combined' },
                    { id: 'sessions', label: 'Mentorships' },
                    { id: 'registrations', label: 'Registrations' },
                    { id: 'jobs', label: 'Jobs Posted' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setChartMetric(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        chartMetric === m.id
                          ? 'bg-brand-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Date Range Selector */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="6m">Last 6 Months</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="1m">Current Month</option>
                </select>
              </div>
            </div>

            {/* Recharts Area / Line Chart with live MongoDB data */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredMonthlyData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0e8ee9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0e8ee9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ad5ef6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ad5ef6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />

                  {(chartMetric === 'all' || chartMetric === 'sessions') && (
                    <Area
                      type="monotone"
                      name="Mentorship Sessions"
                      dataKey="sessions"
                      stroke="#0e8ee9"
                      strokeWidth={2}
                      fill="url(#colorSessions)"
                    />
                  )}

                  {(chartMetric === 'all' || chartMetric === 'registrations') && (
                    <Area
                      type="monotone"
                      name="User Registrations"
                      dataKey="registrations"
                      stroke="#ad5ef6"
                      strokeWidth={2}
                      fill="url(#colorRegs)"
                    />
                  )}

                  {(chartMetric === 'all' || chartMetric === 'jobs') && (
                    <Area
                      type="monotone"
                      name="Opportunities Posted"
                      dataKey="jobs"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorJobs)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white">Alumni by Industry</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.industryDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#ad5ef6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white">Mentorship Requests by Domain</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.domainDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#0e8ee9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cloud Health Diagnostics */}
          {healthData && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">MongoDB & Cloud Engine Health</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Database</span>
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MongoDB ({healthData.database?.state})
                  </div>
                  <p className="text-[11px] text-slate-500">{healthData.database?.database}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Storage Provider</span>
                  <div className="font-bold text-brand-400">{healthData.cloudStorage?.provider}</div>
                  <p className="text-[11px] text-slate-500">Live Object Upload Pipeline</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Server Uptime</span>
                  <div className="font-bold text-slate-200">{healthData.uptimeSeconds} seconds</div>
                  <p className="text-[11px] text-slate-500">Node: {healthData.nodeVersion}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITY AUDIT STREAM */}
      {activeTab === 'activities' && (
        <div className="p-6 rounded-3xl glass-panel space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-brand-400" />
                <span>MongoDB Activity Audit Stream</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live chronological ledger of user actions, application tracking, registrations, and administrative tasks
              </p>
            </div>

            <button
              onClick={fetchActivities}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
            <span className="font-semibold text-slate-400">Filter By Category:</span>
            {['All', 'membership', 'mentorship', 'career', 'event', 'system'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActivityCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  activityCategory === cat
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Activities Table */}
          {activityLoading ? (
            <div className="p-12 text-center text-slate-400">Loading MongoDB activity records...</div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ActivityIcon className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No activities found in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Initiator</th>
                    <th className="p-3.5">Action & Category</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activities.map((act) => (
                    <tr key={act._id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3.5 whitespace-nowrap text-slate-400">
                        {new Date(act.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{act.user?.name || 'Anonymous User'}</div>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-brand-400">
                          {act.user?.role || 'User'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-emerald-400">
                            {act.action}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-slate-800 text-slate-300">
                            {act.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{act.title}</div>
                        {act.description && (
                          <div className="text-[11px] text-slate-400">{act.description}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE JOBS */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Job Opportunities Directory</h2>
              <p className="text-xs text-slate-400">Add, edit, remove, and monitor live jobs stored in MongoDB</p>
            </div>

            <button
              onClick={() => handleOpenAddModal('job')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Job</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs by role, company, location, or skills..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Location & Type</th>
                  <th className="p-3.5">Salary / Package</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {jobs
                  .filter((j) => {
                    const matchText =
                      !searchTerm ||
                      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      j.location.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchType = filterType === 'All' || j.employmentType === filterType;
                    return matchText && matchType;
                  })
                  .map((job) => (
                    <tr key={job._id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{job.title}</span>
                          {job.isDemoData && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ACADEMIC DEMO DATA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-brand-400 font-semibold">{job.company}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{job.location}</div>
                        <span className="text-[10px] text-slate-500 font-medium">{job.employmentType}</span>
                      </td>
                      <td className="p-3.5 text-emerald-400 font-semibold">{job.salary}</td>
                      <td className="p-3.5">
                        {new Date(job.deadline).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.computedStatus === 'Expired'
                              ? 'bg-rose-500/20 text-rose-300'
                              : job.computedStatus === 'Closing Soon'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {job.computedStatus || job.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setViewItem({ type: 'job', data: job })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal('job', job)}
                          className="p-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('job', job._id, job.title)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE INTERNSHIPS */}
      {activeTab === 'internships' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Internships Opportunities Directory</h2>
              <p className="text-xs text-slate-400">Add, edit, remove, and manage student internships stored in MongoDB</p>
            </div>

            <button
              onClick={() => handleOpenAddModal('internship')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Internship</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search internships by role, company, or duration..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Types</option>
              <option value="Summer Internship">Summer Internship</option>
              <option value="Winter Internship">Winter Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Duration & Type</th>
                  <th className="p-3.5">Stipend</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {internships
                  .filter((inItem) => {
                    const matchText =
                      !searchTerm ||
                      inItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inItem.company.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchType = filterType === 'All' || inItem.internshipType === filterType;
                    return matchText && matchType;
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{item.title}</span>
                          {item.isDemoData && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ACADEMIC DEMO DATA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-purple-400 font-semibold">{item.company}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{item.duration}</div>
                        <span className="text-[10px] text-slate-500">{item.internshipType}</span>
                      </td>
                      <td className="p-3.5 text-emerald-400 font-semibold">{item.stipend}</td>
                      <td className="p-3.5">
                        {new Date(item.deadline).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.computedStatus === 'Expired'
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.computedStatus === 'Closing Soon'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.computedStatus || item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setViewItem({ type: 'internship', data: item })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal('internship', item)}
                          className="p-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('internship', item._id, item.title)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MANAGE EVENTS */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Events & Workshops Management</h2>
              <p className="text-xs text-slate-400">Schedule on-campus and hybrid workshops, meetups, and conferences</p>
            </div>

            <button
              onClick={() => handleOpenAddModal('event')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 shadow-md shadow-pink-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Event</span>
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Event Name</th>
                  <th className="p-3.5">Organizer</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Venue</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{ev.title}</span>
                        {ev.isDemoData && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ACADEMIC DEMO DATA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-pink-400 font-medium">{ev.eventType}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{ev.organizer}</td>
                    <td className="p-3.5">
                      <div>
                        {new Date(ev.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500">{ev.time}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{ev.venue}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ev.computedStatus === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : ev.computedStatus === 'Closing Soon'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {ev.computedStatus || ev.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setViewItem({ type: 'event', data: ev })}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal('event', ev)}
                        className="p-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('event', ev._id, ev.title)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: MANAGE WEBINARS */}
      {activeTab === 'webinars' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Live Webinars & Masterclasses</h2>
              <p className="text-xs text-slate-400">Host virtual sessions with Zoom, Google Meet, or Teams links</p>
            </div>

            <button
              onClick={() => handleOpenAddModal('webinar')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-500 shadow-md shadow-accent-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Webinar</span>
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Webinar Title</th>
                  <th className="p-3.5">Speaker</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Platform</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {webinars.map((wb) => (
                  <tr key={wb._id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{wb.title}</span>
                        {wb.isDemoData && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ACADEMIC DEMO DATA
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{wb.organizer}</div>
                    </td>
                    <td className="p-3.5 text-brand-400 font-semibold">{wb.speaker}</td>
                    <td className="p-3.5">
                      <div>
                        {new Date(wb.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500">{wb.time}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                        {wb.platform}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          wb.computedStatus === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : wb.computedStatus === 'Closing Soon'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {wb.computedStatus || wb.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setViewItem({ type: 'webinar', data: wb })}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal('webinar', wb)}
                        className="p-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('webinar', wb._id, wb.title)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: USERS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Member Directory Moderation</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Organization / Dept</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{u.name}</span>
                        {u.isDemoData && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ACADEMIC DEMO DATA
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-3.5 capitalize font-semibold text-brand-400">{u.role}</td>
                    <td className="p-3.5">
                      <div>{u.company || u.department || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{u.jobTitle}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {u.role === 'alumni' && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.verified ? 'bg-brand-500/20 text-brand-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {u.verified ? 'Verified' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {u.role === 'alumni' && (
                        <button
                          onClick={() => handleVerifyAlumni(u._id, !u.verified)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            u.verified
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {u.verified ? 'Unverify' : 'Verify Alumni'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleUserActive(u._id, u.isActive)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-slate-700/80 overflow-hidden">
            <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white capitalize">
                {isEditing ? `Edit ${modalType}` : `+ Add New ${modalType}`} (MongoDB)
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Dynamic Form inputs based on modalType */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {modalType === 'job'
                      ? 'Job Title *'
                      : modalType === 'internship'
                      ? 'Internship Role *'
                      : modalType === 'event'
                      ? 'Event Title *'
                      : 'Webinar Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {modalType === 'job' || modalType === 'internship'
                      ? 'Company Name *'
                      : 'Organizer / Host *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company || formData.organizer || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: e.target.value,
                        organizer: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Webinar Speaker Field */}
              {modalType === 'webinar' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Keynote Speaker *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Chen - Staff Software Engineer at Google"
                    value={formData.speaker || ''}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {/* Type and Platform / Location Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalType === 'job' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                      <select
                        value={formData.employmentType || 'Full-time'}
                        onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {modalType === 'internship' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Internship Type</label>
                      <select
                        value={formData.internshipType || 'Summer Internship'}
                        onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Summer Internship">Summer Internship</option>
                        <option value="Winter Internship">Winter Internship</option>
                        <option value="Full-time Internship">Full-time Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 Months (Summer 2026)"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {modalType === 'event' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type</label>
                      <select
                        value={formData.eventType || 'Workshop'}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Alumni Meet">Alumni Meet</option>
                        <option value="Networking">Networking</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Conference">Conference</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="Auditorium B or Hybrid Stream Link"
                        value={formData.venue || ''}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                {modalType === 'webinar' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Platform</label>
                      <select
                        value={formData.platform || 'Zoom'}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="YouTube Live">YouTube Live</option>
                        <option value="Webex">Webex</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Time String *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 6:00 PM - 7:30 PM EST"
                        value={formData.time || ''}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Compensation & Skills for Jobs/Internships */}
              {(modalType === 'job' || modalType === 'internship') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {modalType === 'job' ? 'Salary / Package' : 'Stipend'}
                    </label>
                    <input
                      type="text"
                      value={formData.salary || formData.stipend || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: e.target.value,
                          stipend: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, Python, AWS, Docker"
                      value={formData.skills || ''}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Date & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(modalType === 'event' || modalType === 'webinar') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration / Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                {modalType === 'event' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Event Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM - 1:00 PM EST"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Official Application / Registration Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Registration / Application URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://company.com/apply/id123 or https://meet.google.com/xyz"
                  value={formData.applicationLink || formData.registrationLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationLink: e.target.value,
                      registrationLink: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Qualifications *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed outline of the role, qualifications, agenda, or learning outcomes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 shadow-md"
                >
                  {formSubmitting ? 'Saving to MongoDB...' : isEditing ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl glass-panel p-6 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{viewItem.data.title}</h3>
                <p className="text-xs text-brand-400">{viewItem.data.company || viewItem.data.organizer}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex flex-wrap gap-4 text-slate-400">
                {viewItem.data.location && <span>📍 {viewItem.data.location}</span>}
                {viewItem.data.venue && <span>📍 {viewItem.data.venue}</span>}
                {viewItem.data.platform && <span>🖥️ {viewItem.data.platform}</span>}
                {viewItem.data.date && <span>📅 {new Date(viewItem.data.date).toLocaleDateString()}</span>}
                {viewItem.data.deadline && (
                  <span>⏳ Deadline: {new Date(viewItem.data.deadline).toLocaleDateString()}</span>
                )}
                {viewItem.data.salary && <span className="text-emerald-400">💵 {viewItem.data.salary}</span>}
                {viewItem.data.stipend && <span className="text-emerald-400">💵 {viewItem.data.stipend}</span>}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 whitespace-pre-line leading-relaxed">
                {viewItem.data.description}
              </div>

              {viewItem.data.skills && viewItem.data.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {viewItem.data.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-brand-300 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Stored in MongoDB</span>
              <a
                href={viewItem.data.applicationLink || viewItem.data.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
