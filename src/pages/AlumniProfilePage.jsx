import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  GraduationCap,
  Sparkles,
  Star,
  MessageSquare,
  Linkedin,
  Github,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Award,
  UserPlus,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MentorshipRequestModal from '../components/MentorshipRequestModal';

export default function AlumniProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Connection status state: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [connecting, setConnecting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/alumni/${id}`);
        if (res.data.success) {
          setAlumni(res.data.alumni);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load alumni profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [id]);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!user || !id || user.id === id) return;
      try {
        const res = await api.get(`/connections/status/${id}`);
        if (res.data.success) {
          setConnectionStatus(res.data.status);
        }
      } catch (err) {
        console.warn('Could not check connection status:', err);
      }
    };

    fetchConnectionStatus();
  }, [id, user]);

  const handleStartChat = async () => {
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
      console.error(err);
      navigate('/chat');
    }
  };

  const handleSendConnection = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setConnecting(true);
    try {
      const res = await api.post('/connections/request', {
        recipientId: alumni._id,
        message: `Hi ${alumni.name}, I would love to connect with you on the alumni network!`,
      });
      if (res.data.success) {
        setConnectionStatus('pending_sent');
        showToast(`Connection request sent to ${alumni.name}!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send connection request.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-[#64748B] animate-pulse">
        <div className="h-64 rounded-3xl bg-white border border-[#E2E8F0]" />
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#263247]">{error || 'Alumni Not Found'}</h2>
        <Link to="/alumni" className="text-[#647FE8] text-sm font-semibold hover:underline">
          Return to Alumni Directory
        </Link>
      </div>
    );
  }

  const isSelf = user && user.id === alumni._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#647FE8] text-white font-bold text-xs shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/alumni"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#263247] transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      {/* Academic Demo Data Notice Banner */}
      {alumni.isDemoData && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs leading-relaxed shadow-xs">
          <span className="px-2 py-0.5 rounded bg-amber-200/80 font-extrabold text-[10px] tracking-wider uppercase text-amber-900 flex-shrink-0">
            ACADEMIC DEMO DATA
          </span>
          <p>
            <strong>Simulated Academic Persona:</strong> This profile is an illustrative demonstration persona. Verification badges are strictly awarded by authorized platform administrators upon identity verification and persisted in MongoDB.
          </p>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EAF1FF] blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={
                alumni.profileImage ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${alumni.name}`
              }
              alt={alumni.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-[#E2E8F0] shadow-sm"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263247] tracking-tight">
                  {alumni.name}
                </h1>
                {alumni.verified === true && !alumni.isDemoData ? (
                  <ShieldCheck className="w-6 h-6 text-[#647FE8]" title="Administrator Verified Alumni" />
                ) : alumni.isDemoData ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    ACADEMIC DEMO DATA
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-bold text-[#647FE8]">{alumni.jobTitle || 'Industry Professional'}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <strong className="text-[#263247]">{alumni.company || 'Tech Partner'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Class of {alumni.graduationYear || 2022} ({alumni.department || 'Computer Science'})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {alumni.location || 'Remote'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {!isSelf && (
              <button
                onClick={handleSendConnection}
                disabled={connectionStatus !== 'none' || connecting}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                  connectionStatus === 'accepted'
                    ? 'bg-[#DDF7F0] text-emerald-800 border border-emerald-300'
                    : connectionStatus === 'pending_sent'
                    ? 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                    : 'bg-[#F8FAFC] text-[#263247] hover:bg-[#EAF1FF] hover:text-[#647FE8] border border-[#E2E8F0]'
                }`}
              >
                {connectionStatus === 'accepted' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Connected</span>
                  </>
                ) : connectionStatus === 'pending_sent' ? (
                  <>
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <span>Request Pending</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowRequestModal(true)}
              className="flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-sm transition"
            >
              Request 1-on-1 Mentorship
            </button>
            <button
              onClick={handleStartChat}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0] transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#64748B]" />
              <span>Message</span>
            </button>
          </div>

        </div>

        {/* Links bar */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            {alumni.linkedin && (
              <a
                href={alumni.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#263247] hover:text-[#647FE8] transition font-medium"
              >
                <Linkedin className="w-4 h-4 text-[#647FE8]" />
                <span>LinkedIn Profile</span>
              </a>
            )}
            {alumni.github && (
              <a
                href={alumni.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#263247] hover:text-[#647FE8] transition font-medium"
              >
                <Github className="w-4 h-4 text-[#263247]" />
                <span>GitHub</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-700 font-bold bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{alumni.avgRating || 4.9}</span>
              <span className="text-[#64748B] font-normal">
                ({alumni.reviews?.length || 5} student reviews)
              </span>
            </div>
            <span>•</span>
            <span className="text-emerald-700 font-semibold bg-[#DDF7F0] px-2 py-0.5 rounded border border-emerald-200">
              {alumni.totalCompletedSessions || 12} Sessions Completed
            </span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Main Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About / Bio */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-3">
            <h3 className="text-base font-bold text-[#263247]">About Mentor</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {alumni.bio || alumni.experienceDetails || 'Industry engineering leader dedicated to mentoring future technologists.'}
            </p>
          </div>

          {/* Technical Skills & Specializations */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
            <h3 className="text-base font-bold text-[#263247]">Technical Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {(alumni.skills || []).map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#263247]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Mentorship Focus Domains */}
          {alumni.mentorshipDomains && (
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
              <h3 className="text-base font-bold text-[#263247]">Mentorship Domains Offered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alumni.mentorshipDomains.map((domain, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 text-xs font-medium text-[#263247]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#647FE8] flex-shrink-0" />
                    <span>{domain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Reviews & Testimonials */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#263247]">Student Testimonials & Reviews</h3>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{alumni.avgRating || 4.9} / 5.0</span>
              </div>
            </div>

            {alumni.reviews && alumni.reviews.length > 0 ? (
              <div className="space-y-3">
                {alumni.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            rev.student?.profileImage ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.student?.name || 'student'}`
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-[#263247]">
                          {rev.student?.name || 'Undergraduate Student'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] italic">"{rev.comment}"</p>
                    <div className="text-[10px] text-[#94A3B8] font-medium">
                      Topic: {rev.topic || 'System Design & Career Strategy'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">No public reviews submitted yet.</p>
            )}
          </div>

        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">
          
          {/* AI Match Overview Card */}
          {alumni.aiMatch && (
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EAF1FF] text-[#647FE8]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#263247]">AI Match Assessment</h4>
                  <p className="text-xs text-[#647FE8] font-bold">
                    {alumni.aiMatch.score}% Compatibility
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#64748B]">
                <p className="font-semibold text-[#263247]">Why this mentor fits your profile:</p>
                {(alumni.aiMatch.matchFactors || []).map((factor, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#647FE8] flex-shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] transition shadow-xs"
              >
                Send Mentorship Pitch
              </button>
            </div>
          )}

          {/* Quick Mentorship Info */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-3.5 text-xs text-[#64748B]">
            <h4 className="text-sm font-bold text-[#263247]">Mentorship Details</h4>
            
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#263247] block">Availability</span>
                <span>{alumni.extraProfile?.availability || '2-3 hours/week (Weekends & Evenings)'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#263247] block">Experience</span>
                <span>{alumni.experience || 6}+ years in enterprise tech</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#263247] block">Verification</span>
                <span>Verified University Alumnus & Industry Leader</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal */}
      {showRequestModal && (
        <MentorshipRequestModal
          alumni={alumni}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
}
