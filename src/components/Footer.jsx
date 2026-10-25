import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Twitter, Sparkles, Heart, Cloud, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white pt-12 pb-8 text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E2E8F0]">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#647FE8] flex items-center justify-center text-white shadow-md shadow-[#647FE8]/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-[#263247] tracking-tight">
                NexAlumni <span className="text-[#647FE8] text-xs font-bold uppercase">Cloud</span>
              </span>
            </Link>
            <p className="text-xs text-[#64748B] leading-relaxed">
              An intelligent cloud ecosystem bridging universities, students, and distinguished alumni to foster lifelong mentorship, referral networking, and career excellence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-[#DDF7F0] border border-emerald-200 px-2.5 py-1 rounded-full w-fit font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Systems Operational (99.98% Uptime)
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h4 className="text-xs font-bold text-[#263247] uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/dashboard" className="hover:text-[#647FE8] transition">Role Dashboard</Link></li>
              <li><Link to="/alumni" className="hover:text-[#647FE8] transition">Alumni Directory</Link></li>
              <li><Link to="/mentorship" className="hover:text-[#647FE8] transition">1-on-1 Mentorship Hub</Link></li>
              <li><Link to="/jobs" className="hover:text-[#647FE8] transition">Jobs & Internships</Link></li>
              <li><Link to="/events" className="hover:text-[#647FE8] transition">Webinars & Alumni Meets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#263247] uppercase tracking-wider mb-4">AI Intelligence</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/ai-advisor" className="hover:text-[#647FE8] transition flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" /> Virtual AI Copilot</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-[#647FE8] transition">Match Compatibility Engine</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-[#647FE8] transition">Career Roadmap Generator</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-[#647FE8] transition">Mock Interview Bank</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#263247] uppercase tracking-wider mb-4">University & Cloud</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2"><Cloud className="w-3.5 h-3.5 text-[#647FE8]" /> Multi-Cloud Scalable Stack</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Alumni Identity</li>
              <li><span className="text-[#94A3B8]">Office of Alumni Relations</span></li>
              <li><span className="text-[#94A3B8]">Contact: support@alumniplatform.edu</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {new Date().getFullYear()} NexAlumni Cloud Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#64748B]">
            <span className="hover:text-[#263247] cursor-pointer transition">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-[#263247] cursor-pointer transition">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#263247] cursor-pointer transition">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
