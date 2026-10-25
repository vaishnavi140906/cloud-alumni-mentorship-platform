import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Video, MapPin, Tag, Users, Clock, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function CreateEventModal({ onClose, onSuccess, initialKind = 'event' }) {
  const { user } = useAuth();
  const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultDeadline = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const defaultOrganizer =
    user?.department ||
    user?.company ||
    (user?.name ? `${user.name} (Alumni Host)` : 'School of Computer Science & Engineering');

  const defaultSpeaker = user?.name ? `${user.name} (${user.jobTitle || 'Industry Leader'})` : '';

  const [sessionKind, setSessionKind] = useState(initialKind); // 'event' | 'webinar'

  const [formData, setFormData] = useState({
    title: '',
    organizer: defaultOrganizer,
    speaker: defaultSpeaker,
    platform: 'Zoom',
    eventType: 'Workshop',
    date: defaultDate,
    time: '6:00 PM - 7:30 PM EST',
    venue: 'Virtual Zoom / Campus Hall',
    registrationLink: 'https://meet.google.com/nex-alumni-session',
    capacity: 150,
    deadline: defaultDeadline,
    tags: 'System Design, Career Prep, Q&A',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.date || !formData.description.trim() || !formData.organizer.trim() || !formData.registrationLink.trim()) {
      setError('Please fill out all required fields: Title, Organizer, Date, Time, Registration Link, and Description.');
      return;
    }

    if (sessionKind === 'event' && !formData.venue.trim()) {
      setError('Please provide a venue or meeting location for the event.');
      return;
    }

    if (sessionKind === 'webinar' && !formData.speaker.trim()) {
      setError('Please provide the keynote speaker name & designation for the webinar.');
      return;
    }

    // Validate event date (must be today or in the future)
    const selectedEventDate = new Date(formData.date);
    const endOfToday = new Date();
    endOfToday.setHours(0, 0, 0, 0);

    if (isNaN(selectedEventDate.getTime()) || selectedEventDate < endOfToday) {
      setError('Event date must be today or a future date.');
      return;
    }

    // Validate RSVP deadline if provided (must not be after event date)
    if (formData.deadline) {
      const selectedDeadline = new Date(formData.deadline);
      if (selectedDeadline > selectedEventDate) {
        setError('Registration deadline cannot be scheduled after the event date.');
        return;
      }
    }

    // URL validation & auto-formatting
    let cleanUrl = formData.registrationLink.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch (urlErr) {
      setError('Please provide a valid registration URL (e.g. https://meet.google.com/session-code)');
      return;
    }

    setSubmitting(true);

    try {
      let res;
      if (sessionKind === 'webinar') {
        res = await api.post('/webinars', {
          title: formData.title.trim(),
          organizer: formData.organizer.trim(),
          speaker: formData.speaker.trim(),
          description: formData.description.trim(),
          date: formData.date,
          time: formData.time.trim(),
          platform: formData.platform || 'Zoom',
          registrationLink: cleanUrl,
          deadline: formData.deadline ? new Date(formData.deadline) : undefined,
          capacity: Number(formData.capacity) > 0 ? Number(formData.capacity) : 150,
        });
      } else {
        res = await api.post('/events', {
          title: formData.title.trim(),
          organizer: formData.organizer.trim(),
          eventType: formData.eventType,
          description: formData.description.trim(),
          date: formData.date,
          time: formData.time.trim(),
          venue: formData.venue.trim(),
          registrationLink: cleanUrl,
          capacity: Number(formData.capacity) > 0 ? Number(formData.capacity) : 100,
          deadline: formData.deadline ? new Date(formData.deadline) : undefined,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        });
      }

      if (res.data.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden text-[#263247]">
        
        {/* Header */}
        <div className="p-6 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              sessionKind === 'webinar'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-pink-100 text-pink-700 border-pink-200'
            }`}>
              {sessionKind === 'webinar' ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#263247]">
                {sessionKind === 'webinar' ? 'Host a Technical Webinar' : 'Schedule a Campus Event'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {sessionKind === 'webinar'
                  ? 'Stream virtual keynotes, system design breakdowns, and Q&A'
                  : 'Organize in-person workshops, seminars, and alumni networking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#E2E8F0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSessionKind('event')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              sessionKind === 'event'
                ? 'bg-pink-100 text-pink-700 border border-pink-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Campus Event / Workshop</span>
          </button>
          <button
            type="button"
            onClick={() => setSessionKind('webinar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              sessionKind === 'webinar'
                ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Webinar (Backend API)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Session Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={sessionKind === 'webinar' ? "e.g. Distributed Systems & High-Scale Microservices" : "e.g. Annual Alumni Career & Networking Gala"}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Host / Organizer *
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="e.g. School of Computer Science & Engineering / Google Alumni"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          {sessionKind === 'webinar' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Keynote Speaker & Designation *
                </label>
                <input
                  type="text"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Chen (Staff Engineer @ Google Cloud)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Streaming Platform
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="YouTube Live">YouTube Live</option>
                  <option value="Webex">Webex</option>
                  <option value="Virtual Auditorium">Virtual Auditorium</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Event Format
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="Workshop">Technical Workshop</option>
                  <option value="Seminar">Distinguished Seminar</option>
                  <option value="Alumni Meet">Alumni Meetup</option>
                  <option value="Networking">Networking Session</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Conference">Tech Conference</option>
                  <option value="Career Fair">Career Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Physical Venue / Location *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Campus Student Center, Room 302"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Session Date *
              </label>
              <input
                type="date"
                name="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Registration Deadline
              </label>
              <input
                type="date"
                name="deadline"
                max={formData.date}
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Time & Duration *
              </label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. 5:30 PM - 7:00 PM EST"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Max RSVPs / Capacity Limit
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min={5}
                max={5000}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Official Meeting / Registration Link *
              </label>
              <input
                type="text"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/xxx-xxxx"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          {sessionKind === 'event' && (
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Tags & Key Topics (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Kubernetes, Python, System Design, Career Prep, Q&A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Session Agenda & Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline what students and alumni will learn, key takeaways, and speaker details..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 shadow-md ${
                sessionKind === 'webinar'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20'
              }`}
            >
              {submitting ? 'Publishing...' : sessionKind === 'webinar' ? 'Publish Webinar' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

