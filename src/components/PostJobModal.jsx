import React, { useState } from 'react';
import { X, Briefcase, Plus, AlertCircle, Building2, MapPin, DollarSign, Sparkles, Calendar, Link as LinkIcon, Clock } from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';

export default function PostJobModal({ onClose, onSuccess, initialType = 'job' }) {
  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [isInternship, setIsInternship] = useState(initialType === 'internship');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Remote / Hybrid',
    workArrangement: 'Hybrid',
    employmentType: 'Full-time',
    internshipType: 'Summer Internship',
    duration: '3 Months (Summer)',
    skills: '',
    experience: 'Entry Level (0-2 years)',
    salary: '$120,000 - $145,000 / year',
    stipend: '$45 / hour',
    applicationLink: '',
    source: 'Campus Recruiter / Alumni Submission',
    sourceUrl: '',
    deadline: defaultDeadline,
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field presence validation
    if (!formData.title.trim() || !formData.company.trim() || !formData.applicationLink.trim() || !formData.description.trim() || !formData.deadline) {
      setError('Please fill out all required fields: Title, Company, Link, Deadline, and Description');
      return;
    }

    if (!formData.source || !formData.source.trim()) {
      setError('Please provide a documented source for this listing.');
      return;
    }

    // Deadline date validation (must be today or future)
    const selectedDeadline = new Date(formData.deadline);
    const endOfToday = new Date();
    endOfToday.setHours(0, 0, 0, 0);

    if (isNaN(selectedDeadline.getTime()) || selectedDeadline < endOfToday) {
      setError('Application deadline must be today or a future date.');
      return;
    }

    // URL format validation & normalization
    let cleanUrl = formData.applicationLink.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch (urlErr) {
      setError('Please provide a valid official application URL (e.g. https://company.com/careers/job123)');
      return;
    }

    let cleanSourceUrl = formData.sourceUrl ? formData.sourceUrl.trim() : '';
    if (cleanSourceUrl && !cleanSourceUrl.startsWith('http://') && !cleanSourceUrl.startsWith('https://')) {
      cleanSourceUrl = `https://${cleanSourceUrl}`;
    }

    setSubmitting(true);

    const parsedSkills = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      let res;
      if (isInternship) {
        res = await api.post('/internships', {
          title: formData.title.trim(),
          company: formData.company.trim(),
          location: formData.location.trim() || 'Remote',
          workArrangement: formData.workArrangement,
          internshipType: formData.internshipType,
          description: formData.description.trim(),
          skills: parsedSkills,
          stipend: formData.stipend ? formData.stipend.trim() : 'Paid / Competitive Stipend',
          duration: formData.duration || '3 Months (Summer)',
          applicationLink: cleanUrl,
          source: formData.source.trim(),
          sourceUrl: cleanSourceUrl,
          deadline: formData.deadline,
        });
      } else {
        res = await api.post('/jobs', {
          title: formData.title.trim(),
          company: formData.company.trim(),
          location: formData.location.trim() || 'Remote',
          workArrangement: formData.workArrangement,
          employmentType: formData.employmentType,
          description: formData.description.trim(),
          skills: parsedSkills,
          salary: formData.salary ? formData.salary.trim() : 'Competitive',
          experience: formData.experience || 'Entry Level (0-2 years)',
          applicationLink: cleanUrl,
          source: formData.source.trim(),
          sourceUrl: cleanSourceUrl,
          deadline: formData.deadline,
        });
      }

      if (res.data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post opportunity');
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
            <div className="w-10 h-10 rounded-2xl bg-[#EAF1FF] text-[#647FE8] flex items-center justify-center border border-[#D6E4FF]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#263247]">Post an Opportunity</h3>
              <p className="text-xs text-[#64748B]">Share verified jobs or internships with the student & alumni network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#E2E8F0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Kind Switcher */}
        <div className="px-6 pt-4">
          <div className="p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsInternship(false)}
              className={`py-2 rounded-lg transition ${
                !isInternship
                  ? 'bg-white text-[#647FE8] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#263247]'
              }`}
            >
              💼 Direct Job Position
            </button>
            <button
              type="button"
              onClick={() => setIsInternship(true)}
              className={`py-2 rounded-lg transition ${
                isInternship
                  ? 'bg-white text-emerald-700 shadow-sm border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#263247]'
              }`}
            >
              🎓 Student Internship
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {isInternship ? 'Internship Title *' : 'Job Title *'}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={isInternship ? 'e.g. Cloud Engineering Summer Intern' : 'e.g. Senior Cloud Solutions Engineer'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Hiring Organization / Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google / Microsoft / Startup"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {isInternship ? 'Internship Type' : 'Employment Type'}
              </label>
              {isInternship ? (
                <select
                  name="internshipType"
                  value={formData.internshipType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="Summer Internship">Summer Internship</option>
                  <option value="Winter Internship">Winter Internship</option>
                  <option value="Full-time Internship">Full-time Internship</option>
                  <option value="Part-time Internship">Part-time Internship</option>
                  <option value="Remote">Remote</option>
                  <option value="Virtual Residency">Virtual Residency</option>
                </select>
              ) : (
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Freelance">Freelance</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Work Arrangement
              </label>
              <select
                name="workArrangement"
                value={formData.workArrangement}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Seattle, WA / Remote"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Key Skills Required (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, AWS, Docker"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {isInternship ? 'Stipend / Compensation' : 'Salary Range'}
              </label>
              <input
                type="text"
                name={isInternship ? 'stipend' : 'salary'}
                value={isInternship ? formData.stipend : formData.salary}
                onChange={handleChange}
                placeholder={isInternship ? 'e.g. $45/hr or $8,000/mo' : 'e.g. $130k - $160k/yr'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            {isInternship ? (
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Internship Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="3 Months (Summer)">3 Months (Summer)</option>
                  <option value="6 Months">6 Months Co-op</option>
                  <option value="Spring Semester">Spring Semester</option>
                  <option value="Full Year">Full Year</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                >
                  <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                  <option value="Mid-Level (2-5 years)">Mid-Level (2-5 years)</option>
                  <option value="Senior Level (5+ years)">Senior Level (5+ years)</option>
                  <option value="Staff / Principal">Staff / Principal</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Official Application Link / Referral URL *
            </label>
            <input
              type="text"
              name="applicationLink"
              value={formData.applicationLink}
              onChange={handleChange}
              placeholder="https://company.com/careers/job123"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Documented Source *
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g. Official Careers Portal, Campus Recruiting Team"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Source Reference URL (Optional)
              </label>
              <input
                type="text"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleChange}
                placeholder="https://company.com/jobs/press-release"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Role Overview & Requirements *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline what the role involves, technical stack, eligibility, and qualifications..."
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-md shadow-[#647FE8]/20 transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : isInternship ? 'Publish Internship' : 'Publish Job Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
