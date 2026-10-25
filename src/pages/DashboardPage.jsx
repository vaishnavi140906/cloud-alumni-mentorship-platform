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
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Building2,
  MapPin,
  TrendingUp,
  Plus,
  Layers,
  Award,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user, isStudent, isAlumni, isMentor, isCompany, isAdmin, canPostOpportunities, updateProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [trackedApplications, setTrackedApplications] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myPostings, setMyPostings] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const requests = [];

      // 1. Mentorship data
      if (isStudent) {
        requests.push(api.get('/mentorship/my-requests').catch(() => ({ data: { requests: [] } })));
      } else if (isAlumni || isMentor) {
        requests.push(api.get('/mentorship/incoming').catch(() => ({ data: { requests: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { requests: [] } }));
      }

      // 2. Application tracking data (students)
      if (isStudent) {
        requests.push(api.get('/applications').catch(() => ({ data: { applications: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { applications: [] } }));
      }

      // 3. Registered events
      requests.push(api.get('/events/my-registrations').catch(() => ({ data: { registrations: [] } })));

      // 4. Recruiter / Alumni postings
      if (canPostOpportunities) {
        requests.push(api.get('/jobs?postedByMe=true').catch(() => ({ data: { jobs: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { jobs: [] } }));
      }

      const [mentorRes, appRes, eventRes, jobRes] = await Promise.all(requests);

      if (mentorRes.data.success || mentorRes.data.requests) {
        setMentorshipRequests(mentorRes.data.requests || []);
      }
      if (appRes.data.success || appRes.data.applications) {
        setTrackedApplications(appRes.data.applications || []);
      }
      if (eventRes.data.success || eventRes.data.registrations) {
        setRegisteredEvents(eventRes.data.registrations || []);
      }
      if (jobRes.data.success || jobRes.data.jobs) {
        setMyPostings(jobRes.data.jobs || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Toggle mentor availability
  const handleToggleAvailability = async () => {
    setAvailabilityUpdating(true);
    try {
      const newStatus = !user.mentorshipAvailable;
      await updateProfile({ mentorshipAvailable: newStatus });
      showToast(newStatus ? 'Mentorship availability enabled!' : 'Mentorship availability paused.');
    } catch (err) {
      showToast('Failed to update availability.');
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  // Mentor Accept/Reject request
  const handleUpdateMentorshipStatus = async (requestId, status) => {
    try {
      const res = await api.put(`/mentorship/${requestId}/status`, { status });
      if (res.data.success) {
        setMentorshipRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status } : r))
        );
        showToast(`Mentorship request marked as ${status}!`);
      }
    } catch (err) {
      showToast('Failed to update request');
    }
  };

  // Profile completion calculation
  const profilePercent = user?.profileCompletion || 70;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#647FE8] text-white font-bold text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Welcome Card */}
      <div className="p-8 rounded-3xl glass-panel relative overflow-hidden bg-white border border-[#E2E8F0] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#647FE8] text-xs font-bold border border-[#D6E4FF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="capitalize">{user?.role === 'company' ? 'Recruiter' : user?.role} Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-[#64748B]">
              {isStudent && "Track your career milestones, mentorship inquiries, and university job applications in real time."}
              {(isAlumni || isMentor) && "Mentor rising undergraduates, review incoming session inquiries, and share industry referrals."}
              {isCompany && "Manage company job requisitions, view student applications, and engage top university talent."}
              {isAdmin && "Administer the platform ecosystem, moderate user verifications, and monitor activity streams."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(isAlumni || isMentor) && (
              <button
                onClick={handleToggleAvailability}
                disabled={availabilityUpdating}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
                  user?.mentorshipAvailable
                    ? 'bg-[#DDF7F0] text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${user?.mentorshipAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{user?.mentorshipAvailable ? 'Mentorship Active' : 'Mentorship Paused'}</span>
              </button>
            )}

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#F1F5F9] text-[#263247] hover:bg-slate-200 border border-[#E2E8F0] transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Sync Dashboard</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Bar for Students / Alumni */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#263247] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#647FE8]" />
              <span>Profile Readiness Score</span>
            </span>
            <span className="font-extrabold text-[#647FE8]">{profilePercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#EAF1FF] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#647FE8] to-[#8AA7F8] transition-all duration-500"
              style={{ width: `${profilePercent}%` }}
            />
          </div>
          {profilePercent < 100 && (
            <p className="text-[11px] text-[#64748B] mt-2">
              Add technical skills, portfolio links, and a detailed bio to increase your match compatibility by 30%.{' '}
              <Link to="/profile" className="text-[#647FE8] font-bold hover:underline">
                Complete Profile →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isStudent && (
          <>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Mentorship Requests</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {mentorshipRequests.length}
              </div>
              <div className="text-[11px] text-[#647FE8] font-medium">
                {mentorshipRequests.filter((r) => r.status === 'Accepted').length} Accepted •{' '}
                {mentorshipRequests.filter((r) => r.status === 'Pending').length} Pending
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Tracked Applications</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {trackedApplications.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {trackedApplications.filter((a) => a.stage === 'Interview' || a.stage === 'Offer').length} Active Pipeline
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Registered Events</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {registeredEvents.length}
              </div>
              <div className="text-[11px] text-pink-600 font-medium">Workshops & Meets</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">AI Career Copilot</span>
              <div className="text-2xl font-extrabold text-[#263247]">Ready</div>
              <Link to="/ai-advisor" className="text-[11px] text-[#647FE8] font-bold hover:underline block">
                Start AI Session →
              </Link>
            </div>
          </>
        )}

        {(isAlumni || isMentor) && (
          <>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Incoming Requests</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {mentorshipRequests.filter((r) => r.status === 'Pending').length}
              </div>
              <div className="text-[11px] text-amber-600 font-medium">Awaiting your response</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Active Mentees</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {mentorshipRequests.filter((r) => r.status === 'Accepted').length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">In mentorship track</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Published Opportunities</span>
              <div className="text-2xl font-extrabold text-[#263247]">{myPostings.length}</div>
              <div className="text-[11px] text-[#647FE8] font-medium">Jobs & Internships</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Registered Events</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {registeredEvents.length}
              </div>
              <div className="text-[11px] text-purple-600 font-medium">Community sessions</div>
            </div>
          </>
        )}

        {isCompany && (
          <>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Active Listings</span>
              <div className="text-2xl font-extrabold text-[#263247]">{myPostings.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">Published on Campus Portal</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Candidate Engagement</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {myPostings.reduce((sum, p) => sum + (p.applicantsCount || 0), 0)}
              </div>
              <div className="text-[11px] text-[#647FE8] font-medium">Applications & referral clicks</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Campus Recruiter Badge</span>
              <div className="text-2xl font-extrabold text-[#263247]">Verified</div>
              <div className="text-[11px] text-purple-600 font-medium">{user?.company || 'Enterprise'}</div>
            </div>

            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Quick Action</span>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-1 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Role</span>
              </Link>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Administrator Access</span>
              <div className="text-2xl font-extrabold text-[#263247]">Super Admin</div>
              <Link to="/admin" className="text-[11px] text-[#647FE8] font-bold hover:underline block">
                Open Admin Console →
              </Link>
            </div>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Audit Log Status</span>
              <div className="text-2xl font-extrabold text-emerald-600">Active</div>
              <div className="text-[11px] text-[#64748B]">MongoDB Stream</div>
            </div>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Platform Health</span>
              <div className="text-2xl font-extrabold text-emerald-600">100% Online</div>
              <div className="text-[11px] text-[#64748B]">Engine Operational</div>
            </div>
            <div className="p-5 rounded-3xl glass-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Opportunities</span>
              <div className="text-2xl font-extrabold text-[#263247]">{myPostings.length}</div>
              <Link to="/jobs" className="text-[11px] text-[#647FE8] font-bold hover:underline block">
                Manage Directory →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ROLE SPECIFIC WORKFLOW SECTIONS */}
      {/* 1. Student Sections: Mentorship Pipeline & Application Tracker Snapshot */}
      {isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Mentorships */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#647FE8]" />
                <h3 className="text-base font-bold text-[#263247]">My Mentorship Tracks</h3>
              </div>
              <Link to="/mentorship" className="text-xs font-bold text-[#647FE8] hover:underline">
                Explore Mentors →
              </Link>
            </div>

            {mentorshipRequests.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] space-y-2">
                <p className="text-sm font-semibold text-[#263247]">No mentorship requests submitted yet</p>
                <p className="text-xs">Browse alumni profiles to find mentors in System Design, AI, and Cloud engineering.</p>
                <Link
                  to="/alumni"
                  className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9]"
                >
                  Find a Mentor
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mentorshipRequests.slice(0, 4).map((req) => (
                  <div
                    key={req._id}
                    className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#263247]">{req.topic}</span>
                        {req.isDemoData && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 uppercase">
                            ACADEMIC DEMO DATA
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Mentor: {req.alumniId?.name || 'Alumni Mentor'} • {req.alumniId?.company || 'Tech Enterprise'}
                      </p>
                    </div>

                    <Link
                      to="/mentorship"
                      className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#647FE8] hover:bg-[#EAF1FF]"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Tracker Snapshot */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#647FE8]" />
                <h3 className="text-base font-bold text-[#263247]">Application Pipeline Snapshot</h3>
              </div>
              <Link to="/jobs" className="text-xs font-bold text-[#647FE8] hover:underline">
                Full Tracker →
              </Link>
            </div>

            {trackedApplications.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] space-y-2">
                <p className="text-sm font-semibold text-[#263247]">No applications tracked yet</p>
                <p className="text-xs">Browse jobs & internships and save them to track your interview stages.</p>
                <Link
                  to="/jobs"
                  className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9]"
                >
                  Explore Jobs & Internships
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trackedApplications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#263247]">{app.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF1FF] text-[#647FE8]">
                          {app.stage}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {app.company} • {app.location}
                      </p>
                    </div>

                    <Link
                      to="/jobs"
                      className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#647FE8] hover:bg-[#EAF1FF]"
                      title="Open Tracker"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Mentor & Alumni Section: Incoming Requests & Direct Actions */}
      {(isAlumni || isMentor) && (
        <div className="p-6 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#263247] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#647FE8]" />
                <span>Pending Mentorship Inquiries</span>
              </h3>
              <p className="text-xs text-[#64748B]">Undergraduates requesting your industry guidance</p>
            </div>
            <Link to="/mentorship" className="text-xs font-bold text-[#647FE8] hover:underline">
              View All Mentorships →
            </Link>
          </div>

          {mentorshipRequests.filter((r) => r.status === 'Pending').length === 0 ? (
            <div className="p-8 text-center text-[#64748B] space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-[#263247]">You are all caught up!</p>
              <p className="text-xs">No pending requests awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mentorshipRequests
                .filter((r) => r.status === 'Pending')
                .map((req) => (
                  <div
                    key={req._id}
                    className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#263247]">{req.topic}</span>
                        {req.isDemoData && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 uppercase">
                            ACADEMIC DEMO DATA
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-[#647FE8] font-semibold">
                        Student: {req.studentId?.name || 'Undergraduate'} ({req.studentId?.department || 'Computer Science'})
                      </p>
                      <p className="text-xs text-[#64748B] line-clamp-2 italic">
                        "{req.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleUpdateMentorshipStatus(req._id, 'Accepted')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Mentee</span>
                      </button>
                      <button
                        onClick={() => handleUpdateMentorshipStatus(req._id, 'Rejected')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-rose-600 bg-white border border-[#E2E8F0]"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* QUICK LAUNCH SHORTCUTS BAR */}
      <div className="p-6 rounded-3xl glass-panel space-y-3">
        <h3 className="text-sm font-bold text-[#263247]">Quick Platform Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          <Link
            to="/alumni"
            className="p-3.5 rounded-2xl bg-[#EAF1FF] text-[#647FE8] hover:bg-[#D6E4FF] transition flex items-center justify-between"
          >
            <span>Alumni Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/jobs"
            className="p-3.5 rounded-2xl bg-[#DDF7F0] text-emerald-800 hover:bg-emerald-100 transition flex items-center justify-between"
          >
            <span>Opportunities Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/events"
            className="p-3.5 rounded-2xl bg-[#F0ECFF] text-purple-800 hover:bg-purple-100 transition flex items-center justify-between"
          >
            <span>Campus Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/ai-advisor"
            className="p-3.5 rounded-2xl bg-[#F1F5F9] text-[#263247] hover:bg-slate-200 transition flex items-center justify-between"
          >
            <span>AI Career Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
