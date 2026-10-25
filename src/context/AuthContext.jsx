import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState(null);

  // Load user profile on initial render if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchDemoAccounts = async () => {
      try {
        const res = await api.get('/auth/demo-accounts');
        if (res.data.success) {
          setDemoAccounts(res.data.demoAccounts);
        }
      } catch (err) {
        console.warn('Could not fetch demo accounts:', err.message);
      }
    };

    fetchCurrentUser();
    fetchDemoAccounts();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const res = await api.put('/auth/updatedetails', updatedData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Update profile failed');
  };

  const switchDemoRole = async (roleName) => {
    const emailMap = {
      student: 'alex.johnson@university.edu',
      alumni: 'sarah.chen@google.com',
      mentor: 'elena.mentor@alumniplatform.edu',
      company: 'recruiter@techcorp.com',
      admin: 'admin@alumniplatform.edu',
    };

    const email = emailMap[roleName] || 'alex.johnson@university.edu';
    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
        demoAccounts,
        isAuthenticated: Boolean(user),
        isStudent: user?.role === 'student',
        isAlumni: user?.role === 'alumni',
        isMentor: user?.role === 'mentor',
        isCompany: user?.role === 'company',
        isAdmin: user?.role === 'admin',
        canPostOpportunities: ['alumni', 'mentor', 'company', 'admin'].includes(user?.role),
        canOfferMentorship: ['alumni', 'mentor'].includes(user?.role) || user?.mentorshipAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
