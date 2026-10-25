import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Bell,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Zap,
  GraduationCap,
  Building2,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isStudent, isAlumni, isMentor, isCompany, isAdmin, canPostOpportunities } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications periodically or on open
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  const navLinks = [
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: Layers }] : []),
    { name: 'Alumni Directory', path: '/alumni', icon: Users },
    { name: 'Mentorship Hub', path: '/mentorship', icon: GraduationCap },
    { name: 'Jobs & Internships', path: '/jobs', icon: Briefcase },
    { name: 'Events & Webinars', path: '/events', icon: Calendar },
    { name: 'AI Career Copilot', path: '/ai-advisor', icon: Sparkles, badge: 'AI' },
    { name: 'Messages', path: '/chat', icon: MessageSquare, requireAuth: true },
    ...(isAdmin ? [{ name: 'Admin Console', path: '/admin', icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#647FE8] flex items-center justify-center shadow-md shadow-[#647FE8]/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#263247]">
                  NexAlumni
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAF1FF] text-[#647FE8] border border-[#D6E4FF]">
                  CLOUD
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
                Intelligent Alumni Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EAF1FF] text-[#647FE8] border border-[#D6E4FF] shadow-sm'
                      : 'text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#647FE8]' : 'text-[#64748B]'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-[#F0ECFF] text-[#8B5CF6] border border-[#C4B5FD] rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9] relative transition border border-[#E2E8F0]"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#647FE8] text-[9px] font-extrabold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-card z-50 overflow-hidden border border-[#E2E8F0]">
                    <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#263247]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-[#EAF1FF] text-[#647FE8] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-[#647FE8] hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-[#64748B] text-xs">
                          No notifications yet. You're all caught up!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-3.5 transition hover:bg-[#F8FAFC] text-left ${
                              !notif.read ? 'bg-[#EAF1FF]/30' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-[#263247]">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#647FE8] flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-[#94A3B8] mt-1.5 block">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm transition"
                >
                  <img
                    src={
                      user.profileImage ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`
                    }
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover border border-[#647FE8]/40"
                  />
                  <span className="text-xs font-semibold text-[#263247] hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] mr-0.5" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-card p-2 z-50 border border-[#E2E8F0]">
                    <div className="px-3 py-2.5 border-b border-[#E2E8F0]">
                      <p className="text-sm font-bold text-[#263247] truncate">{user.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : user.role === 'company'
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'mentor'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'alumni'
                          ? 'bg-[#EAF1FF] text-[#647FE8]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role === 'company' ? 'Recruiter' : user.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs font-medium">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#263247] hover:bg-[#F8FAFC] rounded-xl transition"
                      >
                        <Layers className="w-4 h-4 text-[#647FE8]" />
                        Role Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#263247] hover:bg-[#F8FAFC] rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-[#64748B]" />
                        My Profile & Activity History
                      </Link>

                      <Link
                        to="/mentorship"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#263247] hover:bg-[#F8FAFC] rounded-xl transition"
                      >
                        <GraduationCap className="w-4 h-4 text-[#64748B]" />
                        {isMentor ? 'Mentor Console' : 'Mentorship Hub'}
                      </Link>

                      <Link
                        to="/jobs"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#263247] hover:bg-[#F8FAFC] rounded-xl transition"
                      >
                        <Briefcase className="w-4 h-4 text-[#64748B]" />
                        {canPostOpportunities ? 'Recruiter Hub & Postings' : 'Application Tracker'}
                      </Link>

                      <Link
                        to="/events"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#263247] hover:bg-[#F8FAFC] rounded-xl transition"
                      >
                        <Calendar className="w-4 h-4 text-[#64748B]" />
                        Campus Events
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl transition font-bold"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#263247] hover:bg-[#F1F5F9] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md shadow-[#647FE8]/25 transition"
                >
                  Join Network
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#263247] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            if (link.requireAuth && !user) return null;
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#EAF1FF] text-[#647FE8]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#64748B]" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0ECFF] text-[#8B5CF6] rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
