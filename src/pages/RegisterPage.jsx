import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Building2, AlertCircle, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    degree: 'Bachelor of Technology',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
    company: '',
    jobTitle: '',
    skills: 'React, Node.js, Python, AWS',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await register({
        ...formData,
        role,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#647FE8] flex items-center justify-center mx-auto text-white shadow-md shadow-[#647FE8]/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#263247] tracking-tight">
            Create Your NexAlumni Account
          </h1>
          <p className="text-xs text-[#64748B]">
            Join students, distinguished alumni, mentors, and recruiters in our cloud network.
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="p-1.5 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'student'
                ? 'bg-[#647FE8] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#263247]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('alumni')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'alumni'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#263247]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Alumni</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('mentor')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'mentor'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#263247]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mentor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('company')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'company'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#263247]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Recruiter</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jordan Smith"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={role === 'company' ? 'recruiter@company.com' : 'jordan.smith@university.edu'}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            {/* Academic fields for Students and Alumni */}
            {(role === 'student' || role === 'alumni') && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Degree / Academic Program *
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                  >
                    <option value="Bachelor of Technology">Bachelor of Technology (B.Tech)</option>
                    <option value="Bachelor of Science in Computer Science">Bachelor of Science in CS (B.S.)</option>
                    <option value="Master of Science in Computer Science">Master of Science in CS (M.S.)</option>
                    <option value="Master of Technology">Master of Technology (M.Tech)</option>
                    <option value="Ph.D. in Computer Science">Ph.D. in Computer Science</option>
                    <option value="Bachelor of Engineering">Bachelor of Engineering (B.E.)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                      Department
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
                </div>
              </>
            )}

            {/* Professional fields for Alumni, Mentors, and Companies */}
            {(role === 'alumni' || role === 'mentor' || role === 'company') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    {role === 'company' ? 'Company Name *' : 'Current Company'}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={role === 'company' ? 'e.g. Stripe / Meta' : 'e.g. Google / Microsoft'}
                    required={role === 'company'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    {role === 'company' ? 'Recruiter Role *' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder={role === 'company' ? 'e.g. University Recruiter' : 'e.g. Senior SWE'}
                    required={role === 'company'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {role === 'company' ? 'Hiring Domains / Roles' : 'Skills & Technical Interests (comma-separated)'}
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder={role === 'company' ? 'e.g. Cloud Infrastructure, AI Engineering, Full-Stack' : 'e.g. React, Python, Cloud, Docker, Machine Learning'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] focus:outline-none focus:border-[#647FE8] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#536edb] shadow-md shadow-[#647FE8]/25 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#647FE8] font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
