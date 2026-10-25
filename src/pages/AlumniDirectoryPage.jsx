import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Building2,
  MapPin,
  Sparkles,
  GraduationCap,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Users,
  CheckCircle2,
  UserPlus,
  Clock,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MentorshipRequestModal from '../components/MentorshipRequestModal';

export default function AlumniDirectoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAlumniForModal, setSelectedAlumniForModal] = useState(null);

  // Connection statuses dictionary: { [targetUserId]: 'none' | 'pending_sent' | 'pending_received' | 'accepted' }
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [connectingUserId, setConnectingUserId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchConnections = async () => {
    if (!user) return;
    try {
      const res = await api.get('/connections');
      if (res.data.success) {
        const statuses = {};
        res.data.connections.forEach((c) => {
          if (c.user?._id) {
            if (c.status === 'accepted') {
              statuses[c.user._id] = 'accepted';
            } else if (c.status === 'pending') {
              statuses[c.user._id] = c.isRequester ? 'pending_sent' : 'pending_received';
            }
          }
        });
        setConnectionStatuses(statuses);
      }
    } catch (err) {
      console.warn('Could not load connections:', err);
    }
  };

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCompany !== 'All') params.append('company', selectedCompany);
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (mentorshipOnly) params.append('mentorshipOnly', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/alumni?${params.toString()}`);
      if (res.data.success) {
        setAlumniList(res.data.alumni);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Alumni fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAlumni();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCompany, selectedDepartment, mentorshipOnly, sortBy]);

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const handleStartChat = async (alumni) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/chat/conversation', { targetUserId: alumni._id });
      if (res.data.success) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
      navigate('/chat');
    }
  };

  const handleSendConnection = async (alumni) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setConnectingUserId(alumni._id);
    try {
      const res = await api.post('/connections/request', {
        recipientId: alumni._id,
        message: `Hi ${alumni.name}, I would love to connect with you on the alumni network!`,
      });
      if (res.data.success) {
        setConnectionStatuses((prev) => ({
          ...prev,
          [alumni._id]: 'pending_sent',
        }));
        showToast(`Connection request sent to ${alumni.name}!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send connection request.');
    } finally {
      setConnectingUserId(null);
    }
  };

  const companies = ['All', 'Google', 'Microsoft', 'Amazon', 'Stripe', 'Meta', 'Apple', 'NVIDIA', 'Netflix'];
  const departments = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Human-Computer Interaction & CS',
    'Electronics & Computer Engineering',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Feedback Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#647FE8] text-white font-bold text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EAF1FF] blur-[80px] pointer-events-none rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#647FE8] text-xs font-bold border border-[#D6E4FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#647FE8]" />
              <span>AI-Powered Alumni Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
              Connect with Industry Leaders & Alumni
            </h1>
            <p className="text-sm text-[#64748B]">
              Discover verified alumni mentors ranked by AI compatibility matching your skills, department, and career aspirations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center shadow-xs">
              <span className="text-2xl font-extrabold text-[#263247] block">{totalCount}</span>
              <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">
                Alumni Profiles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, job title, skills, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
            />
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  Company: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
            >
              <option value="match">Sort: AI Match Score</option>
              <option value="experience">Sort: Years of Experience</option>
              <option value="rating">Sort: Top Rated Mentors</option>
            </select>
          </div>

        </div>

        {/* Second Row Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#64748B]">Department:</span>
            {departments.slice(0, 3).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedDepartment === dept
                    ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8]'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#263247] border border-[#E2E8F0]'
                }`}
              >
                {dept === 'All' ? 'All Departments' : dept.split('&')[0]}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#263247] hover:text-[#647FE8] transition">
            <input
              type="checkbox"
              checked={mentorshipOnly}
              onChange={(e) => setMentorshipOnly(e.target.checked)}
              className="rounded bg-[#F8FAFC] border-[#CBD5E1] text-[#647FE8] focus:ring-[#647FE8]"
            />
            <span>Available for Mentorship Only</span>
          </label>
        </div>
      </div>

      {/* Alumni Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-[#E2E8F0] h-72 animate-pulse" />
          ))}
        </div>
      ) : alumniList.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#E2E8F0] text-center space-y-3 shadow-card">
          <Users className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-lg font-bold text-[#263247]">No alumni found</h3>
          <p className="text-xs text-[#64748B]">
            Try adjusting your search query or reset the company/department filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumni) => {
            const matchScore = alumni.aiMatch?.score || 85;
            const matchLevel = alumni.aiMatch?.matchLevel || 'Strong Match';
            const connStatus = connectionStatuses[alumni._id] || 'none';
            const isSelf = user && user.id === alumni._id;

            return (
              <div
                key={alumni._id}
                className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card hover:shadow-hover hover:border-[#647FE8]/40 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* AI Match & Status Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1FF] border border-[#D6E4FF] text-[11px] font-bold text-[#647FE8] shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#647FE8]" />
                    <span>{matchScore}% AI Match</span>
                  </div>

                  {alumni.isDemoData ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-extrabold tracking-wider uppercase">
                      ACADEMIC DEMO DATA
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{alumni.avgRating || 'New'}</span>
                      {alumni.totalMentorships ? (
                        <span className="text-[10px] text-[#64748B] font-normal">
                          ({alumni.totalMentorships})
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      alumni.profileImage ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${alumni.name}`
                    }
                    alt={alumni.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E2E8F0] flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/alumni/${alumni._id}`}
                        className="text-base font-bold text-[#263247] hover:text-[#647FE8] transition truncate"
                      >
                        {alumni.name}
                      </Link>
                      {alumni.verified === true && !alumni.isDemoData && (
                        <ShieldCheck className="w-4 h-4 text-[#647FE8] flex-shrink-0" title="Administrator Verified Alumni" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#647FE8] truncate mt-0.5">
                      {alumni.jobTitle || 'Industry Professional'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span className="font-semibold text-[#263247]">{alumni.company || 'Tech Partner'}</span>
                      <span>•</span>
                      <span>Class of '{String(alumni.graduationYear || 2022).slice(-2)}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {alumni.bio || alumni.experienceDetails || 'Industry engineering leader dedicated to mentoring future technologists.'}
                </p>

                {/* Skills & Domains */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(alumni.skills || []).slice(0, 4).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[11px] font-medium text-[#263247] border border-[#E2E8F0]"
                      >
                        {s}
                      </span>
                    ))}
                    {(alumni.skills || []).length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[#64748B] font-bold">
                        +{alumni.skills.length - 4}
                      </span>
                    )}
                  </div>

                  {alumni.mentorshipDomains && alumni.mentorshipDomains.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#F0ECFF] border border-[#DDD6FE] text-[11px] text-[#5B21B6]">
                      <span className="font-bold">Focus:</span> {alumni.mentorshipDomains[0]}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center gap-2 border-t border-[#E2E8F0]">
                  {/* Connect Button */}
                  {!isSelf && (
                    <button
                      onClick={() => handleSendConnection(alumni)}
                      disabled={connStatus !== 'none' || connectingUserId === alumni._id}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        connStatus === 'accepted'
                          ? 'bg-[#DDF7F0] text-emerald-800 border border-emerald-300'
                          : connStatus === 'pending_sent'
                          ? 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                          : 'bg-[#F8FAFC] text-[#263247] hover:bg-[#EAF1FF] hover:text-[#647FE8] border border-[#E2E8F0]'
                      }`}
                      title={connStatus === 'accepted' ? 'Connected' : 'Connect with Alumni'}
                    >
                      {connStatus === 'accepted' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </>
                      ) : connStatus === 'pending_sent' ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Pending</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAlumniForModal(alumni)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] transition shadow-xs"
                  >
                    Mentorship
                  </button>

                  <button
                    onClick={() => handleStartChat(alumni)}
                    className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] transition"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
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
            );
          })}
        </div>
      )}

      {/* Mentorship Modal */}
      {selectedAlumniForModal && (
        <MentorshipRequestModal
          alumni={selectedAlumniForModal}
          onClose={() => setSelectedAlumniForModal(null)}
          onSuccess={() => {
            setSelectedAlumniForModal(null);
            fetchAlumni();
          }}
        />
      )}
    </div>
  );
}
