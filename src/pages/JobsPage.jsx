import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Sparkles,
  Bookmark,
  ExternalLink,
  Plus,
  Building2,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Trash2,
  Edit3,
  Layers,
  Send,
  Award,
  XCircle,
  FileText,
  RefreshCw,
  Eye,
  Check,
  ShieldCheck,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostJobModal from '../components/PostJobModal';

export default function JobsPage() {
  const { user, isStudent, isAlumni, isCompany, isAdmin, canPostOpportunities } = useAuth();

  // Active view tab: 'explore' | 'tracker' | 'recruiter'
  const [activeTab, setActiveTab] = useState('explore');

  // Explore tab states
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'Full-time' | 'Internship' | 'Part-time' | 'Remote'
  const [opportunityMode, setOpportunityMode] = useState('all'); // 'all' | 'jobs' | 'internships'
  const [showPostModal, setShowPostModal] = useState(false);
  const [postModalType, setPostModalType] = useState('job');
  const [selectedOppForDetail, setSelectedOppForDetail] = useState(null);

  // Application tracker states
  const [trackedApplications, setTrackedApplications] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerFilterStage, setTrackerFilterStage] = useState('All');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState('');

  // Recruiter / Postings Hub states
  const [myPostings, setMyPostings] = useState([]);
  const [myPostingsLoading, setMyPostingsLoading] = useState(false);
  const [selectedPostingForApplicants, setSelectedPostingForApplicants] = useState(null);
  const [postingApplicants, setPostingApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Fetch Explore Opportunities (Jobs + Internships)
  const fetchExploreOpportunities = async () => {
    setLoading(true);
    try {
      const jobParams = new URLSearchParams();
      if (search) jobParams.append('search', search);
      if (selectedType !== 'All' && selectedType !== 'Internship') {
        jobParams.append('employmentType', selectedType);
      }

      const internshipParams = new URLSearchParams();
      if (search) internshipParams.append('search', search);

      const requests = [];
      if (opportunityMode === 'all' || opportunityMode === 'jobs') {
        requests.push(api.get(`/jobs?${jobParams.toString()}`));
      } else {
        requests.push(Promise.resolve({ data: { jobs: [] } }));
      }

      if (opportunityMode === 'all' || opportunityMode === 'internships') {
        requests.push(api.get(`/internships?${internshipParams.toString()}`));
      } else {
        requests.push(Promise.resolve({ data: { internships: [] } }));
      }

      const [jobsRes, internshipsRes] = await Promise.all(requests);

      const rawJobs = (jobsRes.data.jobs || []).map((j) => ({
        ...j,
        kind: 'job',
        displayComp: j.salary || 'Competitive',
        displayType: j.employmentType || 'Full-time',
        applicationLink: j.applicationLink || j.applyUrl || '#',
      }));

      const rawInternships = (internshipsRes.data.internships || []).map((i) => ({
        ...i,
        kind: 'internship',
        displayComp: i.stipend || 'Stipend provided',
        displayType: i.internshipType || 'Internship',
        applicationLink: i.applicationLink || i.applyUrl || '#',
      }));

      // Combine and filter if specific type selected
      let combined = [...rawJobs, ...rawInternships];

      if (selectedType === 'Internship') {
        combined = combined.filter((item) => item.kind === 'internship');
      }

      setOpportunities(combined);
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch User's Application Tracker items
  const fetchMyApplications = async () => {
    if (!user) return;
    setTrackerLoading(true);
    try {
      const params = new URLSearchParams();
      if (trackerFilterStage !== 'All') params.append('stage', trackerFilterStage);

      const res = await api.get(`/applications?${params.toString()}`);
      if (res.data.success) {
        setTrackedApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
    } finally {
      setTrackerLoading(false);
    }
  };

  // 3. Fetch My Postings (Recruiter Hub)
  const fetchMyPostings = async () => {
    if (!user || !canPostOpportunities) return;
    setMyPostingsLoading(true);
    try {
      const [jobsRes, internshipsRes] = await Promise.all([
        api.get('/jobs?postedByMe=true'),
        api.get('/internships?postedByMe=true'),
      ]);

      const myJobs = (jobsRes.data.jobs || []).map((j) => ({ ...j, kind: 'job' }));
      const myInternships = (internshipsRes.data.internships || []).map((i) => ({
        ...i,
        kind: 'internship',
      }));
      setMyPostings([...myJobs, ...myInternships]);
    } catch (err) {
      console.error('Fetch my postings error:', err);
    } finally {
      setMyPostingsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchExploreOpportunities, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedType, opportunityMode]);

  useEffect(() => {
    if (activeTab === 'tracker') {
      fetchMyApplications();
    } else if (activeTab === 'recruiter') {
      fetchMyPostings();
    }
  }, [activeTab, trackerFilterStage]);

  // Handle Save / Bookmark
  const handleToggleSave = async (opp) => {
    if (!user) {
      showToast('Please sign in to bookmark opportunities.');
      return;
    }
    try {
      const endpoint = opp.kind === 'job' ? `/jobs/${opp._id}/save` : `/jobs/${opp._id}/save`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        setOpportunities((prev) =>
          prev.map((item) => (item._id === opp._id ? { ...item, isSaved: res.data.isSaved } : item))
        );
        showToast(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Apply button
  const handleApply = async (opp) => {
    try {
      if (user) {
        const endpoint = opp.kind === 'job' ? `/jobs/${opp._id}/apply` : `/internships/${opp._id}/apply`;
        await api.post(endpoint);

        // Auto-track application in student's Application Tracker in MongoDB
        await api.post('/applications/track', {
          opportunityType: opp.kind,
          opportunityId: opp._id,
          title: opp.title,
          company: opp.company,
          location: opp.location,
          officialApplicationUrl: opp.applicationLink,
          stage: 'Applied',
          notes: `Applied directly on ${new Date().toLocaleDateString()}`,
        });
        showToast('Application logged in your Application Tracker!');
      }
    } catch (err) {
      console.warn('Track on apply notice:', err);
    }

    window.open(opp.applicationLink, '_blank');
  };

  // Quick Action: Add to Application Tracker
  const handleTrackOpportunity = async (opp) => {
    if (!user) {
      showToast('Please log in to track opportunities.');
      return;
    }
    try {
      const res = await api.post('/applications/track', {
        opportunityType: opp.kind,
        opportunityId: opp._id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        officialApplicationUrl: opp.applicationLink,
        stage: 'Saved',
        notes: `Added to tracker from Explore Board`,
      });
      if (res.data.success) {
        showToast(`Saved "${opp.title}" to your Application Tracker!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to tracker.');
    }
  };

  // Application Tracker: Update Stage
  const handleUpdateStage = async (trackerId, newStage) => {
    try {
      const res = await api.put(`/applications/${trackerId}/stage`, {
        stage: newStage,
        note: `Moved to ${newStage} stage.`,
      });
      if (res.data.success) {
        setTrackedApplications((prev) =>
          prev.map((app) => (app._id === trackerId ? res.data.application : app))
        );
        showToast(`Updated status to "${newStage}"!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stage');
    }
  };

  // Application Tracker: Save Notes
  const handleSaveNotes = async (trackerId) => {
    try {
      const res = await api.put(`/applications/${trackerId}/notes`, {
        notes: notesText,
      });
      if (res.data.success) {
        setTrackedApplications((prev) =>
          prev.map((app) => (app._id === trackerId ? { ...app, notes: notesText } : app))
        );
        setEditingNotesId(null);
        showToast('Application notes updated.');
      }
    } catch (err) {
      showToast('Failed to save notes');
    }
  };

  // Application Tracker: Delete Tracker Item
  const handleDeleteTracker = async (trackerId, title) => {
    if (!window.confirm(`Remove "${title}" from your application tracker?`)) return;
    try {
      const res = await api.delete(`/applications/${trackerId}`);
      if (res.data.success) {
        setTrackedApplications((prev) => prev.filter((app) => app._id !== trackerId));
        showToast('Application removed from tracker.');
      }
    } catch (err) {
      showToast('Failed to remove tracker');
    }
  };

  // Recruiter Hub: Toggle status Active / Inactive
  const handleTogglePostingStatus = async (item) => {
    try {
      const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
      const endpoint = item.kind === 'job' ? `/jobs/${item._id}` : `/internships/${item._id}`;
      const res = await api.put(endpoint, { status: newStatus });
      if (res.data.success) {
        setMyPostings((prev) =>
          prev.map((p) => (p._id === item._id ? { ...p, status: newStatus } : p))
        );
        showToast(`Opportunity marked as ${newStatus}`);
      }
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  // Recruiter Hub: Delete posting
  const handleDeletePosting = async (item) => {
    if (!window.confirm(`Permanently delete your posting "${item.title}" from MongoDB?`)) return;
    try {
      const endpoint = item.kind === 'job' ? `/jobs/${item._id}` : `/internships/${item._id}`;
      await api.delete(endpoint);
      setMyPostings((prev) => prev.filter((p) => p._id !== item._id));
      showToast('Posting deleted successfully.');
    } catch (err) {
      showToast('Failed to delete posting');
    }
  };

  // Recruiter Hub: Inspect applicants
  const handleInspectApplicants = async (posting) => {
    setSelectedPostingForApplicants(posting);
    setApplicantsLoading(true);
    try {
      const res = await api.get(`/applications/opportunity/${posting._id}`);
      if (res.data.success) {
        setPostingApplicants(res.data.applicants);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not load candidates');
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Recruiter Hub: Update applicant stage
  const handleRecruiterUpdateStage = async (trackerId, newStage) => {
    try {
      const res = await api.put(`/applications/${trackerId}/stage`, {
        stage: newStage,
        note: `Updated by recruiter to ${newStage}`,
      });
      if (res.data.success) {
        setPostingApplicants((prev) =>
          prev.map((a) => (a._id === trackerId ? res.data.application : a))
        );
        showToast(`Candidate stage moved to ${newStage}!`);
      }
    } catch (err) {
      showToast('Failed to update candidate stage');
    }
  };

  const stageColors = {
    Saved: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
    Applied: 'bg-[#EAF1FF] text-[#647FE8] border-[#D6E4FF]',
    Assessment: 'bg-[#F0ECFF] text-[#5B21B6] border-[#DDD6FE]',
    Interview: 'bg-[#FFFBEB] text-amber-800 border-[#FDE68A]',
    Offer: 'bg-[#DDF7F0] text-emerald-800 border-emerald-300',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Withdrawn: 'bg-slate-100 text-slate-500 border-slate-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#647FE8] text-white font-bold text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF7F0] text-emerald-800 text-xs font-bold border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Alumni & Recruiter Career Exchange</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
              Opportunities & Applications Hub
            </h1>
            <p className="text-sm text-[#64748B]">
              Explore full-time roles and internships, manage student interview stages, or post company openings.
            </p>
          </div>

          {canPostOpportunities && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  setPostModalType('job');
                  setShowPostModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post Job</span>
              </button>
              <button
                onClick={() => {
                  setPostModalType('internship');
                  setShowPostModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post Internship</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'explore'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Explore Opportunities ({opportunities.length})</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'tracker'
                ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
                : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Application Tracker</span>
            {trackedApplications.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D6E4FF] text-[#647FE8] font-bold">
                {trackedApplications.length}
              </span>
            )}
          </button>
        )}

        {canPostOpportunities && (
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'recruiter'
                ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
                : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Recruiter Postings Hub ({myPostings.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: EXPLORE OPPORTUNITIES */}
      {activeTab === 'explore' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filter Controls */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by role, required skills, company, or location..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <select
                  value={opportunityMode}
                  onChange={(e) => setOpportunityMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="all">All Opportunities (Jobs + Internships)</option>
                  <option value="jobs">Full-time & Direct Jobs</option>
                  <option value="internships">Internships Only</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="All">All Work Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Summer Internship">Summer Internship</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
              <span className="font-semibold text-[#64748B]">Quick Filter:</span>
              {['All', 'Full-time', 'Internship', 'Remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedType === type
                      ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8]'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Opportunities */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-white border border-[#E2E8F0] h-64 animate-pulse" />
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white border border-[#E2E8F0] text-center text-[#64748B] space-y-3 shadow-card">
              <Briefcase className="w-12 h-12 text-[#94A3B8] mx-auto" />
              <h3 className="text-lg font-bold text-[#263247]">No opportunities found</h3>
              <p className="text-xs text-[#64748B]">Try modifying your search query or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <div
                  key={opp._id}
                  className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card hover:shadow-hover hover:border-[#647FE8]/40 transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            opp.kind === 'internship'
                              ? 'bg-[#F0ECFF] text-[#5B21B6] border-[#DDD6FE]'
                              : 'bg-[#DDF7F0] text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {opp.displayType}
                        </span>

                        {opp.isDemoData ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                            ACADEMIC DEMO DATA
                          </span>
                        ) : opp.isVerified ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Opening
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium">
                            Recruiter Submission
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          opp.computedStatus === 'Closing Soon'
                            ? 'bg-[#FFFBEB] text-amber-800 border border-[#FDE68A] animate-pulse'
                            : opp.computedStatus === 'Expired'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {opp.computedStatus || 'Active'}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <div>
                      <h3
                        onClick={() => setSelectedOppForDetail(opp)}
                        className="text-base font-bold text-[#263247] hover:text-[#647FE8] cursor-pointer transition"
                      >
                        {opp.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] mt-1">
                        <span className="font-semibold text-[#263247] flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {opp.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#64748B]">
                          <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {opp.location}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{opp.displayComp}</span>
                      </div>
                    </div>

                    {/* Documented Source & Authenticity Info */}
                    <div className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[#64748B]">
                          <strong className="text-[#263247]">Source:</strong> {opp.source || 'Direct Recruiter Submission'}
                        </span>
                        {opp.sourceUrl && (
                          <a
                            href={opp.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#647FE8] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <span>Official Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {opp.isDemoData && (
                        <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200 leading-relaxed">
                          <strong>Demo Simulation:</strong> This record is simulated for academic demonstration. Application links lead to general corporate career portals and illustrative mock examples.
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(opp.skills || opp.skillsRequired || []).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[11px] font-medium text-[#263247] border border-[#E2E8F0]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        Deadline:{' '}
                        {new Date(opp.deadline).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bookmark button */}
                      <button
                        onClick={() => handleToggleSave(opp)}
                        className={`p-2 rounded-xl border transition ${
                          opp.isSaved
                            ? 'bg-[#FFFBEB] text-amber-600 border-[#FDE68A]'
                            : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#263247]'
                        }`}
                        title={opp.isSaved ? 'Bookmarked' : 'Save opportunity'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedOppForDetail(opp)}
                        className="px-3 py-2 rounded-xl font-semibold text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] transition"
                        title="View Full Opportunity Details"
                      >
                        Details
                      </button>

                      {/* Track Application */}
                      {user && (
                        <button
                          onClick={() => handleTrackOpportunity(opp)}
                          className="px-3 py-2 rounded-xl font-semibold text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] transition"
                          title="Save to My Application Tracker"
                        >
                          + Track
                        </button>
                      )}

                      {/* Apply button */}
                      <button
                        onClick={() => handleApply(opp)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white transition shadow-xs ${
                          opp.isDemoData
                            ? 'bg-slate-700 hover:bg-slate-600'
                            : 'bg-[#647FE8] hover:bg-[#536edb]'
                        }`}
                        title={opp.isDemoData ? 'Open illustrative demo application link' : 'Apply via official application URL'}
                      >
                        <span>{opp.isDemoData ? 'Demo Link' : 'Apply Directly'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATION TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tracker Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Tracked', val: trackedApplications.length, color: 'text-[#263247]' },
              {
                label: 'Saved',
                val: trackedApplications.filter((a) => a.stage === 'Saved').length,
                color: 'text-[#64748B]',
              },
              {
                label: 'Applied',
                val: trackedApplications.filter((a) => a.stage === 'Applied').length,
                color: 'text-[#647FE8]',
              },
              {
                label: 'Interviewing',
                val: trackedApplications.filter((a) =>
                  ['Assessment', 'Interview'].includes(a.stage)
                ).length,
                color: 'text-amber-600',
              },
              {
                label: 'Offers',
                val: trackedApplications.filter((a) => a.stage === 'Offer').length,
                color: 'text-emerald-600',
              },
              {
                label: 'Rejected',
                val: trackedApplications.filter((a) => a.stage === 'Rejected').length,
                color: 'text-rose-600',
              },
            ].map((kpi, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] block">{kpi.label}</span>
                <span className={`text-xl font-extrabold ${kpi.color}`}>{kpi.val}</span>
              </div>
            ))}
          </div>

          {/* Stage Filter Selector */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#64748B]">Filter By Stage:</span>
              {['All', 'Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].map(
                (stage) => (
                  <button
                    key={stage}
                    onClick={() => setTrackerFilterStage(stage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      trackerFilterStage === stage
                        ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                    }`}
                  >
                    {stage}
                  </button>
                )
              )}
            </div>

            <button
              onClick={fetchMyApplications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Refresh MongoDB</span>
            </button>
          </div>

          {/* Applications List */}
          {trackerLoading ? (
            <div className="p-12 text-center text-[#64748B]">Loading your applications...</div>
          ) : trackedApplications.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white border border-[#E2E8F0] text-center text-[#64748B] space-y-3 shadow-card">
              <Layers className="w-12 h-12 text-[#94A3B8] mx-auto" />
              <h3 className="text-lg font-bold text-[#263247]">No applications in this stage</h3>
              <p className="text-xs text-[#64748B]">
                Browse the Explore tab and click "+ Track" or "Apply" to add opportunities to your tracker.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          stageColors[app.stage] || stageColors.Saved
                        }`}
                      >
                        {app.stage}
                      </span>
                      <span className="text-[11px] text-[#64748B] uppercase font-semibold">
                        {app.opportunityType}
                      </span>
                      {app.isDemoData && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                          ACADEMIC DEMO DATA
                        </span>
                      )}
                      {app.appliedDate && (
                        <span className="text-[11px] text-[#94A3B8]">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#263247]">{app.title}</h4>
                      <p className="text-xs text-[#647FE8] font-semibold">{app.company} • {app.location}</p>
                    </div>

                    {/* Notes display or editing */}
                    {editingNotesId === app._id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add interview notes, recruiter contacts, or referral details..."
                          className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#263247] flex-1 focus:outline-none focus:border-[#647FE8]"
                        />
                        <button
                          onClick={() => handleSaveNotes(app._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1.5 rounded-lg text-xs text-[#64748B] hover:text-[#263247]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[#64748B] pt-0.5">
                        <span className="line-clamp-1 italic">
                          {app.notes ? `"${app.notes}"` : 'No personal notes attached.'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNotesId(app._id);
                            setNotesText(app.notes || '');
                          }}
                          className="text-[#647FE8] hover:text-[#536edb] font-semibold text-[11px]"
                        >
                          Edit note
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Stage Dropdown + Delete */}
                  <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-[#64748B]">Change Stage:</span>
                      <select
                        value={app.stage}
                        onChange={(e) => handleUpdateStage(app._id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-bold text-[#263247] focus:outline-none focus:border-[#647FE8]"
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </div>

                    {app.officialApplicationUrl && (
                      <a
                        href={app.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 text-[#64748B] border border-[#E2E8F0]"
                        title="Open Application Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteTracker(app._id, app.title)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                      title="Untrack application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECRUITER & POSTINGS HUB */}
      {activeTab === 'recruiter' && canPostOpportunities && (
        <div className="space-y-6 animate-fadeIn">
          {/* Recruiter Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Total Postings Created</span>
              <div className="text-2xl font-extrabold text-[#263247]">{myPostings.length}</div>
              <div className="text-[11px] text-[#647FE8] font-medium">MongoDB opportunities</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Active Listings</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {myPostings.filter((p) => p.status === 'Active').length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">Visible to all students</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-1">
              <span className="text-xs font-semibold text-[#64748B]">Total Candidates Engaged</span>
              <div className="text-2xl font-extrabold text-[#263247]">
                {myPostings.reduce((acc, curr) => acc + (curr.applicantsCount || 0), 0)}
              </div>
              <div className="text-[11px] text-blue-600 font-medium">Applications & referral clicks</div>
            </div>
          </div>

          {/* Postings Table */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#263247]">My Published Postings</h3>
                <p className="text-xs text-[#64748B]">Manage status, inspect applicants, and review deadlines</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPostModalType('job');
                    setShowPostModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  + Post Job
                </button>
                <button
                  onClick={() => {
                    setPostModalType('internship');
                    setShowPostModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-xs"
                >
                  + Post Internship
                </button>
              </div>
            </div>

            {myPostingsLoading ? (
              <div className="p-12 text-center text-[#64748B]">Loading your postings...</div>
            ) : myPostings.length === 0 ? (
              <div className="p-12 text-center text-[#64748B] space-y-2">
                <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <p className="text-sm font-semibold text-[#263247]">You have not posted any opportunities yet.</p>
                <p className="text-xs">Click above to publish your company's first job or internship!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#263247]">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="p-3.5">Title & Company</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Applicants</th>
                      <th className="p-3.5">Deadline</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {myPostings.map((p) => (
                      <tr key={p._id} className="hover:bg-[#F8FAFC] transition">
                        <td className="p-3.5">
                          <div className="font-bold text-[#263247]">{p.title}</div>
                          <div className="text-[11px] text-[#64748B]">{p.company} • {p.location}</div>
                        </td>
                        <td className="p-3.5 font-medium text-[#64748B]">
                          {p.employmentType || p.internshipType || 'Full-time'}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleInspectApplicants(p)}
                            className="inline-flex items-center gap-1.5 font-bold text-[#647FE8] hover:text-[#536edb] bg-[#EAF1FF] hover:bg-[#D6E4FF] px-2.5 py-1 rounded-lg transition"
                            title="Inspect applied student candidates"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{p.applicantsCount || 0} candidates</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-[#64748B]">
                          {new Date(p.deadline).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Active'
                                ? 'bg-[#DDF7F0] text-emerald-800'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleTogglePostingStatus(p)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F1F5F9] hover:bg-slate-200 text-[#263247] border border-[#E2E8F0]"
                          >
                            {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeletePosting(p)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                            title="Delete posting"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recruiter Candidate Inspection Modal */}
      {selectedPostingForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden text-[#263247]">
            <div className="p-6 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#263247]">Candidate Pipeline & Applicants</h3>
                <p className="text-xs text-[#64748B]">
                  Applied candidates for "{selectedPostingForApplicants.title}" at {selectedPostingForApplicants.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedPostingForApplicants(null)}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#E2E8F0] transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {applicantsLoading ? (
                <div className="p-12 text-center text-[#64748B] animate-pulse">
                  Loading candidate applications from MongoDB...
                </div>
              ) : postingApplicants.length === 0 ? (
                <div className="p-12 text-center text-[#64748B] space-y-2">
                  <Users className="w-10 h-10 text-[#94A3B8] mx-auto" />
                  <p className="text-sm font-semibold text-[#263247]">No candidates have tracked or applied yet.</p>
                  <p className="text-xs">
                    When students apply through the referral board or track this opportunity, their profiles appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {postingApplicants.map((app) => {
                    const student = app.student;
                    return (
                      <div
                        key={app._id}
                        className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#263247]">
                              {student?.name || 'Registered Candidate'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                stageColors[app.stage] || stageColors.Saved
                              }`}
                            >
                              {app.stage}
                            </span>
                          </div>
                          <p className="text-xs text-[#647FE8] font-medium">
                            {student?.email || 'Candidate Email'} • {student?.department || 'Computer Science'} ({student?.graduationYear || 'Class of 2026'})
                          </p>
                          {student?.skills && student.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {student.skills.slice(0, 5).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#263247]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {app.notes && (
                            <p className="text-xs text-[#64748B] italic pt-1">Notes: "{app.notes}"</p>
                          )}
                        </div>

                        {/* Recruiter Stage Selector */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs font-semibold text-[#64748B]">Move to:</span>
                          <select
                            value={app.stage}
                            onChange={(e) => handleRecruiterUpdateStage(app._id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#263247] focus:outline-none focus:border-[#647FE8]"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Assessment">Assessment</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOppForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden text-[#263247]">
            {/* Header */}
            <div className="p-6 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedOppForDetail.kind === 'internship'
                        ? 'bg-[#F0ECFF] text-[#5B21B6] border-[#DDD6FE]'
                        : 'bg-[#DDF7F0] text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {selectedOppForDetail.displayType}
                  </span>

                  {selectedOppForDetail.isDemoData ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                      ACADEMIC DEMO DATA
                    </span>
                  ) : selectedOppForDetail.isVerified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official Opening
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium">
                      Recruiter / Alumni Submission
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-[#263247]">{selectedOppForDetail.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#263247]">{selectedOppForDetail.company}</span>
                  <span>•</span>
                  <span>{selectedOppForDetail.location}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{selectedOppForDetail.displayComp}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOppForDetail(null)}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#E2E8F0] transition self-start"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Demo Notice Banner */}
              {selectedOppForDetail.isDemoData && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Academic Demonstration Posting</span>
                  </div>
                  <p className="leading-relaxed">
                    This job/internship listing is a simulated record created for academic system demonstration. The application link directs to a general corporate career portal or illustrative reference page rather than a verified specific opening.
                  </p>
                </div>
              )}

              {/* Source & Authenticity Details */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="font-bold text-[#263247] text-xs">Posting Provenance & Source Metadata</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Documented Source:</span>
                    <strong className="text-[#263247]">{selectedOppForDetail.source || 'Direct Recruiter Posting'}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Verification Status:</span>
                    <strong className={selectedOppForDetail.isVerified ? 'text-emerald-700' : 'text-slate-700'}>
                      {selectedOppForDetail.isVerified ? 'Verified by Admin' : 'Unverified Community Submission'}
                    </strong>
                  </div>
                  {selectedOppForDetail.sourceUrl && (
                    <div className="sm:col-span-2">
                      <span className="text-[#64748B] block">Source Documentation Link:</span>
                      <a
                        href={selectedOppForDetail.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#647FE8] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>{selectedOppForDetail.sourceUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#263247] text-xs uppercase tracking-wider">Role Overview & Responsibilities</h4>
                <p className="text-[#64748B] leading-relaxed whitespace-pre-line text-xs">
                  {selectedOppForDetail.description}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#263247] text-xs uppercase tracking-wider">Required Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedOppForDetail.skills || selectedOppForDetail.skillsRequired || []).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#EAF1FF] text-[#647FE8] text-[11px] font-semibold border border-[#D6E4FF]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-[#64748B]">
                Deadline: {new Date(selectedOppForDetail.deadline).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                {user && (
                  <button
                    onClick={() => {
                      handleTrackOpportunity(selectedOppForDetail);
                      setSelectedOppForDetail(null);
                    }}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-[#263247] bg-white hover:bg-slate-100 border border-[#CBD5E1] transition"
                  >
                    + Add to Tracker
                  </button>
                )}

                <button
                  onClick={() => {
                    handleApply(selectedOppForDetail);
                    setSelectedOppForDetail(null);
                  }}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm ${
                    selectedOppForDetail.isDemoData
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-[#647FE8] hover:bg-[#536edb]'
                  }`}
                >
                  <span>{selectedOppForDetail.isDemoData ? 'Visit Demo Portal' : 'Official Application URL'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <PostJobModal
          initialType={postModalType}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchExploreOpportunities();
            if (activeTab === 'recruiter') fetchMyPostings();
            showToast('New opportunity published to MongoDB!');
          }}
        />
      )}
    </div>
  );
}
