import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Linkedin,
  Github,
  Sparkles,
  Clock,
  Activity as ActivityIcon,
  RefreshCw,
  ExternalLink,
  Briefcase,
  Calendar,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function ProfilePage() {
  const { user, updateProfile, isAlumni, isMentor, isCompany, isStudent } = useAuth();

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'history'

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    degree: user?.degree || 'Bachelor of Technology',
    department: user?.department || '',
    graduationYear: user?.graduationYear || 2026,
    company: user?.company || '',
    jobTitle: user?.jobTitle || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    skills: (user?.skills || []).join(', '),
    interests: (user?.interests || []).join(', '),
    mentorshipAvailable: user?.mentorshipAvailable ?? true,
    mentorshipDomains: (user?.mentorshipDomains || []).join(', '),
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // User's genuine MongoDB Activity History
  const [myActivities, setMyActivities] = useState([]);
  const [activityCategory, setActivityCategory] = useState('All');
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchMyActivities = async () => {
    if (!user) return;
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      if (activityCategory !== 'All') params.append('category', activityCategory);
      params.append('limit', '40');

      const res = await api.get(`/auth/my-activities?${params.toString()}`);
      if (res.data.success) {
        setMyActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Fetch my activities error:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyActivities();
    }
  }, [activeTab, activityCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingAvatar(true);
    setError('');

    try {
      const res = await api.post('/auth/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        await updateProfile({ profileImage: res.data.url });
        setSuccessMsg('Profile photo uploaded and updated!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await updateProfile({
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map((i) => i.trim()).filter(Boolean),
        mentorshipDomains: formData.mentorshipDomains
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      });

      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      setSuccessMsg('Profile updated successfully in MongoDB!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#64748B]">
        Please sign in to view and edit your profile.
      </div>
    );
  }

  const roleBadgeStyles = {
    student: 'bg-[#DDF7F0] text-emerald-800 border-emerald-300',
    alumni: 'bg-[#EAF1FF] text-[#647FE8] border-[#D6E4FF]',
    mentor: 'bg-[#F0ECFF] text-[#5B21B6] border-[#DDD6FE]',
    company: 'bg-[#FFFBEB] text-amber-800 border-[#FDE68A]',
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Profile Card */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <img
              src={
                user.profileImage ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`
              }
              alt=""
              className="w-24 h-24 rounded-3xl object-cover border-2 border-[#647FE8]/50 shadow-md"
            />
            <label className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white text-[11px] font-bold gap-1">
              <Upload className="w-4 h-4" />
              <span>{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
              <input type="file" onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            </label>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-[#263247]">{user.name}</h1>
              {user.verified && <ShieldCheck className="w-5 h-5 text-[#647FE8]" title="Verified Member" />}
            </div>
            <p className="text-xs text-[#647FE8] font-semibold">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  roleBadgeStyles[user.role] || roleBadgeStyles.student
                }`}
              >
                {user.role === 'company' ? 'Recruiter' : user.role}
              </span>
              <span className="text-xs text-[#64748B]">
                {user.company ? `${user.jobTitle || 'Role'} at ${user.company}` : `${user.degree || 'Degree'} • ${user.department || 'University Department'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Subtabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'settings'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'history'
              ? 'bg-[#DDF7F0] text-emerald-800 border border-emerald-400 shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Activity History ({myActivities.length})</span>
        </button>
      </div>

      {/* TAB 1: PROFILE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-6 animate-fadeIn">
          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Location / Timezone
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA / EST"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  {user.role === 'company' ? 'Company / Employer *' : 'Company / Organization'}
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google / TechCorp"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  {user.role === 'company' ? 'Recruiter Role *' : 'Job Title / Academic Standing'}
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Lead Technical Recruiter / Senior SWE"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Academic Credentials (Degree, Department, Grad Year) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Degree / Program
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. Bachelor of Technology"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Academic Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="CS & Engineering"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Professional Bio & Objectives
              </label>
              <textarea
                rows={4}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your career story, areas of focus, or what mentorship guidance you are offering..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Skills & Stacks (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Python, Distributed Systems, Golang, Kubernetes, Docker"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            {(user.role === 'alumni' || user.role === 'mentor') && (
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Mentorship Focus Domains (comma-separated)
                </label>
                <input
                  type="text"
                  name="mentorshipDomains"
                  value={formData.mentorshipDomains}
                  onChange={handleChange}
                  placeholder="e.g. System Design, FAANG Mock Interviews, Cloud Architecture"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            </div>

            {(user.role === 'alumni' || user.role === 'mentor') && (
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                  <input
                    type="checkbox"
                    name="mentorshipAvailable"
                    checked={formData.mentorshipAvailable}
                    onChange={handleChange}
                    className="rounded bg-white border-[#CBD5E1] text-[#647FE8] focus:ring-[#647FE8] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#263247] block">
                      Available for 1-on-1 Student Mentorship
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Allow verified undergraduates to send mentorship inquiries and schedule calls.
                    </span>
                  </div>
                </label>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-md shadow-[#647FE8]/25 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MY ACTIVITY HISTORY (PERSISTED IN MONGODB) */}
      {activeTab === 'history' && (
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#263247] flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Your MongoDB Activity History</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Persistent audit log of your job applications, mentorship interactions, registrations, and events
              </p>
            </div>

            <button
              onClick={fetchMyActivities}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F1F5F9] hover:bg-slate-200 text-[#263247] border border-[#E2E8F0] self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
            <span className="font-semibold text-[#64748B]">Filter:</span>
            {['All', 'career', 'mentorship', 'event', 'membership', 'system'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActivityCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  activityCategory === cat
                    ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8]'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Timeline List */}
          {activityLoading ? (
            <div className="p-12 text-center text-[#64748B]">Loading your activity history...</div>
          ) : myActivities.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] space-y-2">
              <ActivityIcon className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="text-sm font-semibold text-[#263247]">No activity records in this category</p>
              <p className="text-xs">
                As you apply for opportunities, request mentorship, or RSVP to events, your actions are securely logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {myActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-white text-emerald-700 border border-[#CBD5E1]">
                        {act.category}
                      </span>
                      <span className="text-xs font-semibold text-[#263247]">{act.title}</span>
                    </div>

                    {act.description && (
                      <p className="text-xs text-[#64748B] leading-relaxed">{act.description}</p>
                    )}

                    <span className="text-[10px] text-[#94A3B8] block pt-1">
                      {new Date(act.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {act.link && (
                    <Link
                      to={act.link}
                      className="p-2 rounded-xl bg-white hover:bg-[#EAF1FF] text-[#647FE8] border border-[#E2E8F0] flex-shrink-0"
                      title="View Related Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
