import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      await switchDemoRole(role);
      navigate('/');
    } catch (err) {
      setError('Quick login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#647FE8] flex items-center justify-center mx-auto text-white shadow-md shadow-[#647FE8]/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#263247] tracking-tight">
            Welcome to NexAlumni Cloud
          </h1>
          <p className="text-xs text-[#64748B]">
            Sign in to access 1-on-1 mentorship, referral jobs, and AI guidance.
          </p>
        </div>

        {/* Demo Quick Login Bar */}
        <div className="p-4 rounded-2xl bg-[#EAF1FF] space-y-2.5 border border-[#D6E4FF]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#647FE8]">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>One-Click Demo Exploration</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F1F5F9] text-[#263247] border border-[#CBD5E1] shadow-sm transition"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('alumni')}
              className="py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F1F5F9] text-[#263247] border border-[#CBD5E1] shadow-sm transition"
            >
              💼 Alumni
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('mentor')}
              className="py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F1F5F9] text-[#263247] border border-[#CBD5E1] shadow-sm transition"
            >
              ⭐ Mentor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('company')}
              className="py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F1F5F9] text-[#263247] border border-[#CBD5E1] shadow-sm transition"
            >
              🏢 Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="col-span-2 sm:col-span-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white hover:bg-[#F1F5F9] text-[#263247] border border-[#CBD5E1] shadow-sm transition"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-card space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.johnson@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md shadow-[#647FE8]/25 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#64748B]">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#647FE8] font-bold hover:underline">
              Join the Network
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
