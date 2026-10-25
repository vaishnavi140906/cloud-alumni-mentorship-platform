import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Video,
  Users,
  CheckCircle2,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import CreateEventModal from '../components/CreateEventModal';

export default function EventsPage({ initialTab = 'all' }) {
  const { user, isAlumni, isAdmin } = useAuth();

  const [sessionTab, setSessionTab] = useState(initialTab); // 'all' | 'webinars' | 'events'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType !== 'All') params.append('eventType', selectedType);
      if (timeframe) params.append('timeframe', timeframe);

      const requests = [];

      // 1. Campus Events API
      if (sessionTab === 'all' || sessionTab === 'events') {
        requests.push(api.get(`/events?${params.toString()}`).catch(() => ({ data: { events: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { events: [] } }));
      }

      // 2. Webinars API
      if (sessionTab === 'all' || sessionTab === 'webinars') {
        const webinarParams = new URLSearchParams();
        if (search) webinarParams.append('search', search);
        if (timeframe) webinarParams.append('timeframe', timeframe);
        requests.push(api.get(`/webinars?${webinarParams.toString()}`).catch(() => ({ data: { webinars: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { webinars: [] } }));
      }

      const [eventsRes, webinarsRes] = await Promise.all(requests);

      const rawEvents = (eventsRes.data.events || []).map((e) => ({
        ...e,
        kind: 'event',
        displayVenue: e.venue || 'Campus Auditorium',
        displayHost: e.organizer || 'Academic Partner',
        displayFormat: e.eventType || 'Workshop',
      }));

      const rawWebinars = (webinarsRes.data.webinars || []).map((w) => ({
        ...w,
        kind: 'webinar',
        displayVenue: w.platform ? `${w.platform} Live` : 'Virtual Live',
        displayHost: w.speaker ? `${w.speaker} (${w.organizer})` : w.organizer,
        displayFormat: 'Live Webinar',
      }));

      const combined = [...rawEvents, ...rawWebinars].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setEvents(combined);
    } catch (err) {
      console.error('Events/Webinars fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchEvents, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedType, timeframe, sessionTab]);

  const handleToggleRSVP = async (event) => {
    if (!user) {
      alert('Please log in to RSVP for events & webinars.');
      return;
    }

    try {
      const isWebinar = event.kind === 'webinar';
      const registerEndpoint = isWebinar ? `/webinars/${event._id}/register` : `/events/${event._id}/register`;
      const cancelEndpoint = isWebinar ? `/webinars/${event._id}/cancel` : `/events/${event._id}/cancel`;

      if (event.isRegistered) {
        const res = await api.post(cancelEndpoint);
        if (res.data.success) {
          setEvents((prev) =>
            prev.map((e) =>
              e._id === event._id
                ? { ...e, isRegistered: false, attendeesCount: res.data.attendeesCount }
                : e
            )
          );
        }
      } else {
        const res = await api.post(registerEndpoint);
        if (res.data.success) {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          setEvents((prev) =>
            prev.map((e) =>
              e._id === event._id
                ? { ...e, isRegistered: true, attendeesCount: res.data.attendeesCount }
                : e
            )
          );
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'RSVP action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8FAFC]">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-pink-50 via-white to-[#F0ECFF] border border-pink-200/80 shadow-card relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Knowledge Sharing & Alumni Meets</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263247] tracking-tight">
              Webinars, Masterclasses & Events
            </h1>
            <p className="text-sm text-[#64748B]">
              Interactive live sessions hosted by industry leaders on cutting-edge architectures, interview prep, and corporate networking.
            </p>
          </div>

          {(isAlumni || isAdmin) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-600/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Host an Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Format Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 flex-wrap">
        <button
          onClick={() => setSessionTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            sessionTab === 'all'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Sessions</span>
        </button>
        <button
          onClick={() => setSessionTab('webinars')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            sessionTab === 'webinars'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Video className="w-4 h-4 text-purple-600" />
          <span>Technical Webinars</span>
        </button>
        <button
          onClick={() => setSessionTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            sessionTab === 'events'
              ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#647FE8] shadow-xs'
              : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
          }`}
        >
          <Users className="w-4 h-4 text-pink-600" />
          <span>Campus & Community Events</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions by topic, speaker, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-pink-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-pink-500 focus:bg-white"
            >
              <option value="All">All Formats</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Alumni Meet">Alumni Meet</option>
              <option value="Networking">Networking</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Conference">Conference</option>
              <option value="Career Fair">Career Fair</option>
            </select>
          </div>

          <div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-pink-500 focus:bg-white"
            >
              <option value="upcoming">Upcoming Sessions</option>
              <option value="past">Past Recordings & Sessions</option>
            </select>
          </div>

        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-[#E2E8F0] h-64 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#E2E8F0] shadow-card text-center text-[#64748B] space-y-3">
          <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-lg font-bold text-[#263247]">No sessions scheduled in this view</h3>
          <p className="text-xs text-[#64748B]">Check back soon or host the next community workshop!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => {
            const isFull = !ev.isRegistered && (ev.attendeesCount || 0) >= (ev.capacity || 100);

            return (
              <div
                key={ev._id}
                className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-card flex flex-col justify-between space-y-5 hover:border-pink-300 transition group"
              >
                <div className="space-y-3">
                  
                  {/* Format and Date Strip */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        ev.kind === 'webinar'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-pink-100 text-pink-700 border-pink-200'
                      }`}>
                        {ev.displayFormat}
                      </span>

                      {ev.isDemoData && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                          ACADEMIC DEMO DATA
                        </span>
                      )}

                      <span className="text-xs text-[#647FE8] font-medium truncate max-w-[180px]">
                        {ev.displayVenue}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {new Date(ev.date).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title and Speaker */}
                  <div>
                    <h3 className="text-base font-bold text-[#263247] group-hover:text-pink-600 transition">
                      {ev.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                      <span className="font-semibold text-[#263247]">Host: {ev.displayHost}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#64748B]">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {ev.time} {ev.timeZone ? `(${ev.timeZone})` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Simulated Demo Notice */}
                  {ev.isDemoData && (
                    <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                      <strong>Simulated Session:</strong> This webinar/event is an academic demonstration record. Meeting links point to illustrative video conference provider URLs and do not host an active live stream.
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(ev.tags || []).map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-medium text-[#263247] border border-[#E2E8F0]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#64748B] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <strong>{ev.attendeesCount || ev.registeredUsers?.length || 0}</strong> / {ev.capacity || 100} Attending
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(ev.registrationLink || ev.meetingUrl) && (
                      <a
                        href={ev.registrationLink || ev.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          ev.isDemoData
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                            : 'bg-[#EAF1FF] text-[#647FE8] hover:bg-[#D6E4FF]'
                        }`}
                        title={ev.isDemoData ? 'Illustrative placeholder meeting link' : 'Join live meeting'}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{ev.isDemoData ? 'Demo Meeting Link' : 'Join Call / Link'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => handleToggleRSVP(ev)}
                      disabled={isFull}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition shadow-sm ${
                        ev.isRegistered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                          : isFull
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-pink-600 text-white hover:bg-pink-700'
                      }`}
                    >
                      {ev.isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered (Cancel RSVP)</span>
                        </>
                      ) : isFull ? (
                        <span>Session Full ({ev.capacity} max)</span>
                      ) : (
                        <span>RSVP for Free</span>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
