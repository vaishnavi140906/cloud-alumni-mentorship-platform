import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, AlertCircle, Clock, Target, MessageSquare } from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function MentorshipRequestModal({ alumni, onClose, onSuccess }) {
  const [topic, setTopic] = useState(
    alumni?.mentorshipDomains?.[0] || 'System Design & FAANG Interview Preparation'
  );
  const [goalDescription, setGoalDescription] = useState(
    `Seeking guidance on ${alumni?.company || 'tier-1 tech'} interview standards, architectural best practices, and career milestones.`
  );
  const [preferredFrequency, setPreferredFrequency] = useState('Bi-weekly 30-min call');
  const [message, setMessage] = useState('');
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGeneratePitchWithAI = async () => {
    setGeneratingPitch(true);
    setError('');
    try {
      const res = await api.post('/ai/generate-pitch', {
        alumniName: alumni?.name,
        company: alumni?.company,
        domain: topic,
        targetGoal: goalDescription,
      });
      if (res.data.success) {
        setMessage(res.data.pitch);
      }
    } catch (err) {
      console.error(err);
      // Fallback AI pitch template
      setMessage(
        `Dear ${alumni?.name || 'Mentor'},\n\nI hope this message finds you well. I am an undergraduate computer science student following your work at ${alumni?.company || 'your team'} with great inspiration.\n\nI am actively working to level up my skills in ${topic}. Given your leadership in this domain, I would be deeply grateful for the opportunity to connect for a 20-30 minute mentorship session to discuss ${goalDescription}.\n\nThank you very much for your time and dedication to empowering students!\n\nWarm regards.`
      );
    } finally {
      setGeneratingPitch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !message) {
      setError('Please select a topic and enter your introductory message');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/mentorship/request', {
        alumniId: alumni._id,
        topic,
        goalDescription,
        preferredFrequency,
        message,
      });

      if (res.data.success) {
        setSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit mentorship request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263247]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={alumni?.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${alumni?.name}`}
              alt={alumni?.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#647FE8]/40"
            />
            <div>
              <h3 className="text-lg font-bold text-[#263247]">
                Request Mentorship with {alumni?.name}
              </h3>
              <p className="text-xs text-[#647FE8] font-semibold">
                {alumni?.jobTitle} • {alumni?.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {success ? (
          <div className="p-10 text-center space-y-3 bg-[#F8FAFC]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#263247]">Mentorship Request Sent!</h4>
            <p className="text-sm text-[#64748B] max-w-md mx-auto">
              {alumni?.name} has been notified. You will receive an instant notification when they accept or schedule your session.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Topic Select */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Mentorship Domain / Focus Area
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              >
                {(alumni?.mentorshipDomains || [
                  'System Design & Architecture',
                  'FAANG Interview Preparation',
                  'Cloud Engineering & DevOps',
                  'Applied AI & Machine Learning',
                  'Resume & Portfolio Critique',
                  'Career Transition & Networking',
                ]).map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal Description */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Your Primary Milestone / Goal
              </label>
              <input
                type="text"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="e.g., Prepare for Summer SWE Internship System Design interviews"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            {/* Preferred Frequency */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Preferred Meeting Cadence
              </label>
              <select
                value={preferredFrequency}
                onChange={(e) => setPreferredFrequency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              >
                <option value="One-time 30-min strategy session">One-time 30-min strategy session</option>
                <option value="Bi-weekly 30-min call">Bi-weekly 30-min call</option>
                <option value="Monthly 45-min deep dive">Monthly 45-min deep dive</option>
                <option value="Async code & portfolio review">Async code & portfolio review</option>
              </select>
            </div>

            {/* Message with AI Assistant */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Personalized Introductory Message
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePitchWithAI}
                  disabled={generatingPitch}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#647FE8] hover:opacity-90 shadow-sm transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatingPitch ? 'Drafting with AI...' : 'Draft with AI Copilot'}
                </button>
              </div>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself, your background, and why you would value this mentor's guidance (or click 'Draft with AI Copilot' above)..."
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8] focus:bg-white transition resize-none leading-relaxed"
              />
            </div>

            {/* Footer buttons */}
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md shadow-[#647FE8]/25 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending Request...' : 'Send Mentorship Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
