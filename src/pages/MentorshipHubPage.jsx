import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
  FileText,
  Calendar,
  Building2,
  Send,
  AlertCircle,
  Plus,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import MentorshipRequestModal from '../components/MentorshipRequestModal';

export default function MentorshipHubPage() {
  const { user, isAlumni, isMentor } = useAuth();
  const [activeTab, setActiveTab] = useState(isAlumni || isMentor ? 'incoming' : 'recommendations');
  
  const [recommendedAlumni, setRecommendedAlumni] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Notes update state
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState('');

  // Selected alumni for new request
  const [selectedAlumniForModal, setSelectedAlumniForModal] = useState(null);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [recsRes, myReqsRes, incomingRes] = await Promise.all([
          api.get('/alumni/recommendations').catch(() => ({ data: { recommendations: [] } })),
          api.get('/mentorship/my-requests').catch(() => ({ data: { requests: [] } })),
          api.get('/mentorship/incoming').catch(() => ({ data: { requests: [] } })),
        ]);

        if (recsRes.data?.recommendations) setRecommendedAlumni(recsRes.data.recommendations);
        if (myReqsRes.data?.requests) setMyRequests(myReqsRes.data.requests);
        if (incomingRes.data?.requests) setIncomingRequests(incomingRes.data.requests);
      } else {
        const featRes = await api.get('/alumni/featured');
        if (featRes.data.success) setRecommendedAlumni(featRes.data.featured);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [user]);

  const handleUpdateStatus = async (requestId, status, responseMessage = '') => {
    try {
      await api.put(`/mentorship/${requestId}/status`, { status, responseMessage });
      fetchHubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleSaveNotes = async (requestId) => {
    try {
      await api.put(`/mentorship/${requestId}/notes`, { meetingNotes: notesText });
      setEditingNotesId(null);
      fetchHubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update meeting notes');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedRequestForReview) return;
    setSubmittingReview(true);
    try {
      await api.post(`/mentorship/${selectedRequestForReview._id}/feedback`, {
        feedbackRating: rating,
        feedbackReview: reviewText,
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSelectedRequestForReview(null);
      setReviewText('');
      fetchHubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EAF1FF] blur-[80px] pointer-events-none rounded-full" />
        <div className="flex items-center gap-2 text-xs font-bold text-[#647FE8] uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Intelligent Mentorship Ecosystem</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
          1-on-1 Mentorship & Career Guidance
        </h1>
        <p className="text-sm text-[#64748B] max-w-2xl">
          Schedule strategy sessions, conduct mock technical interviews, review code & portfolios, and build connections with senior alumni.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'recommendations'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#647FE8]" />
          <span>AI Recommended Mentors</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'my-requests'
                ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
                : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>My Sent Requests ({myRequests.length})</span>
          </button>
        )}

        {(isAlumni || isMentor || user?.role === 'admin') && (
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'incoming'
                ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
                : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Incoming Student Requests ({incomingRequests.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: AI Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#263247]">Top Mentors Matched For You</h2>
            <Link to="/alumni" className="text-xs font-bold text-[#647FE8] hover:underline">
              Browse All Directory
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedAlumni.map((mentor) => (
              <div
                key={mentor._id}
                className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card hover:shadow-hover hover:border-[#647FE8]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#647FE8] border border-[#D6E4FF]">
                    <Sparkles className="w-3 h-3 text-[#647FE8]" />
                    {mentor.aiMatch?.score || 94}% AI Compatibility
                  </span>
                  {mentor.isDemoData ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-extrabold tracking-wider uppercase">
                      ACADEMIC DEMO DATA
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{mentor.avgRating || 'New'}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3.5">
                  <img
                    src={mentor.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${mentor.name}`}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E2E8F0]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-[#263247]">{mentor.name}</h3>
                      {mentor.verified === true && !mentor.isDemoData && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#647FE8]" title="Administrator Verified Mentor" />
                      )}
                    </div>
                    <p className="text-xs text-[#647FE8] font-semibold">{mentor.jobTitle || 'Industry Professional'}</p>
                    <p className="text-xs text-[#64748B]">{mentor.company || 'Tech Partner'} • {mentor.department || 'Computer Science'}</p>
                  </div>
                </div>

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {mentor.bio || mentor.experienceDetails || 'Experienced technology mentor dedicated to student success.'}
                </p>

                {mentor.mentorshipDomains?.[0] && (
                  <div className="p-2 rounded-xl bg-[#F0ECFF] border border-[#DDD6FE] text-[11px] text-[#5B21B6]">
                    <span className="font-bold">Focus:</span> {mentor.mentorshipDomains[0]}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setSelectedAlumniForModal(mentor)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] transition shadow-xs"
                  >
                    Request Mentorship
                  </button>
                  <Link
                    to={`/alumni/${mentor._id}`}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#263247] bg-[#F1F5F9] hover:bg-slate-200 border border-[#E2E8F0]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Sent Requests */}
      {activeTab === 'my-requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#263247]">Your Mentorship Applications</h2>
          
          {myRequests.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-[#E2E8F0] text-center text-[#64748B] space-y-3 shadow-card">
              <GraduationCap className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="text-sm">You haven't submitted any mentorship requests yet.</p>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb]"
              >
                Browse Recommended Mentors
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.alumniId?.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.alumniId?.name}`}
                        alt=""
                        className="w-11 h-11 rounded-2xl object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#263247]">{req.alumniId?.name}</h3>
                        <p className="text-xs text-[#647FE8] font-medium">{req.alumniId?.jobTitle} • {req.alumniId?.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {req.isDemoData && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                          ACADEMIC DEMO DATA
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          req.status === 'Accepted'
                            ? 'bg-[#DDF7F0] text-emerald-800 border-emerald-300'
                            : req.status === 'Completed'
                            ? 'bg-[#EAF1FF] text-[#647FE8] border-[#647FE8]'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        Status: {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                    <div className="font-bold text-[#263247]">Topic: {req.topic}</div>
                    <div className="text-[#64748B]">"{req.message}"</div>
                    {req.responseMessage && (
                      <div className="pt-2 text-emerald-800 font-medium border-t border-[#E2E8F0]">
                        <strong>Mentor Response:</strong> "{req.responseMessage}"
                      </div>
                    )}
                  </div>

                  {req.meetingNotes && (
                    <div className="p-3.5 rounded-2xl bg-[#EAF1FF] border border-[#D6E4FF] text-xs text-[#263247]">
                      <strong className="block mb-1 text-[#647FE8]">Session & Meeting Notes:</strong>
                      {req.meetingNotes}
                    </div>
                  )}

                  {/* Actions for student */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                    <span className="text-[#94A3B8]">
                      Requested: {new Date(req.requestedAt || req.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status === 'Accepted' && (
                        <button
                          onClick={() => setSelectedRequestForReview(req)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-[#FFFBEB] hover:bg-amber-100 border border-amber-300 transition flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Complete Session & Leave Review</span>
                        </button>
                      )}

                      {req.feedbackRating && (
                        <div className="flex items-center gap-1 text-amber-800 font-bold bg-[#FFFBEB] border border-amber-300 px-2.5 py-1 rounded-lg">
                          <span>Your Rating:</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{req.feedbackRating} / 5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Incoming Requests (Alumni View) */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#263247]">Incoming Student Requests</h2>

          {incomingRequests.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-[#E2E8F0] text-center text-[#64748B] space-y-2 shadow-card">
              <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="text-sm">No incoming mentorship requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.studentId?.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.studentId?.name}`}
                        alt=""
                        className="w-11 h-11 rounded-2xl object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#263247]">{req.studentId?.name}</h3>
                        <p className="text-xs text-[#647FE8] font-medium">
                          {req.studentId?.department || 'Student'} • Class of {req.studentId?.graduationYear || 2026}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {req.isDemoData && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                          ACADEMIC DEMO DATA
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          req.status === 'Accepted'
                            ? 'bg-[#DDF7F0] text-emerald-800 border-emerald-300'
                            : req.status === 'Completed'
                            ? 'bg-[#EAF1FF] text-[#647FE8] border-[#647FE8]'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Message details */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                    <div className="font-bold text-[#263247]">Mentorship Topic: {req.topic}</div>
                    <div className="text-[#64748B] leading-relaxed">"{req.message}"</div>
                    {req.goalDescription && (
                      <div className="text-[#64748B] pt-1">
                        <strong>Goal:</strong> {req.goalDescription}
                      </div>
                    )}
                  </div>

                  {/* Notes edit section */}
                  {req.status === 'Accepted' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#263247]">Session Notes / Action Items</span>
                        {editingNotesId !== req._id && (
                          <button
                            onClick={() => {
                              setEditingNotesId(req._id);
                              setNotesText(req.meetingNotes || '');
                            }}
                            className="text-xs font-bold text-[#647FE8] hover:underline"
                          >
                            {req.meetingNotes ? 'Edit Notes' : '+ Add Meeting Notes'}
                          </button>
                        )}
                      </div>

                      {editingNotesId === req._id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add action items, recommended articles, or next meeting agenda..."
                            className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#263247] resize-none focus:outline-none focus:border-[#647FE8]"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-3 py-1 rounded-lg text-xs text-[#64748B] hover:text-[#263247]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(req._id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb]"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        req.meetingNotes && (
                          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
                            {req.meetingNotes}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Alumni Actions */}
                  {req.status === 'Pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Rejected', 'Currently unable to take new mentees')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Accepted', 'Happy to connect! Look forward to our session.')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                      >
                        Accept Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequestForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4 border border-[#E2E8F0] shadow-2xl">
            <h3 className="text-lg font-bold text-[#263247]">Rate Mentorship Session</h3>
            <p className="text-xs text-[#64748B]">
              Share feedback on your session with {selectedRequestForReview.alumniId?.name}.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#263247] mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263247] mb-1.5">
                  Testimonial / Review
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How did this mentor help you prepare or gain clarity?..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#263247] resize-none focus:outline-none focus:border-[#647FE8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForReview(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#263247]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
                >
                  {submittingReview ? 'Submitting...' : 'Submit 5-Star Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Mentorship Modal */}
      {selectedAlumniForModal && (
        <MentorshipRequestModal
          alumni={selectedAlumniForModal}
          onClose={() => setSelectedAlumniForModal(null)}
          onSuccess={() => {
            setSelectedAlumniForModal(null);
            fetchHubData();
          }}
        />
      )}
    </div>
  );
}
