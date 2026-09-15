import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { MemberLoginPage } from './pages/MemberLoginPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { VerifyPage } from './pages/VerifyPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminSlidersPage } from './pages/admin/AdminSlidersPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { NewsPage } from './pages/NewsPage';
import { HistoryPage } from './pages/HistoryPage';
import { HistoryDetailPage } from './pages/HistoryDetailPage';
import {
  AdminUser,
  Member,
  OrganizationSettings,
} from './types';
import {
  getSettings,
  getMemberMe,
  logoutMember,
  logoutAdmin,
} from './lib/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('pem_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loadingInitial, setLoadingInitial] = useState(true);

  // Initialize data & check sessions
  useEffect(() => {
    const initApp = async () => {
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }

      // Check member token
      const memberToken = localStorage.getItem('pem_member_token');
      if (memberToken) {
        try {
          const meData = await getMemberMe();
          setCurrentMember(meData.member);
          if (meData.settings) {
            setSettings(meData.settings as unknown as OrganizationSettings);
          }
        } catch {
          logoutMember();
          setCurrentMember(null);
        }
      }

      setLoadingInitial(false);
    };

    initApp();

    // Browser navigation (Back / Forward)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Standardize URL
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMemberLoginSuccess = (member: Member) => {
    setCurrentMember(member);
    navigate('/member-dashboard');
  };

  const handleMemberLogout = () => {
    logoutMember();
    setCurrentMember(null);
    navigate('/member-login');
  };

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    localStorage.setItem('pem_admin_user', JSON.stringify(admin));
    navigate('/admin-dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setCurrentAdmin(null);
    localStorage.removeItem('pem_admin_user');
    navigate('/admin-login');
  };

  const handleSettingsUpdated = (updated: OrganizationSettings) => {
    setSettings(updated);
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  // Helper to extract verify param e.g. /verify/PEM20260001
  let initialVerifyId: string | undefined = undefined;
  if (currentPath.startsWith('/verify/')) {
    initialVerifyId = currentPath.replace('/verify/', '').trim().toUpperCase();
  }

  // Render current view
  const renderCurrentView = () => {
    // 1. PUBLIC ROUTES
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} settings={settings} />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} settings={settings} />;
    }

    if (currentPath === '/membership-registration' || currentPath === '/register') {
      return <RegistrationPage onNavigate={navigate} settings={settings} />;
    }

    if (currentPath === '/member-login' || currentPath === '/login') {
      return (
        <MemberLoginPage
          onNavigate={navigate}
          onLoginSuccess={handleMemberLoginSuccess}
          settings={settings}
        />
      );
    }

    if (currentPath === '/member-dashboard' || currentPath === '/dashboard') {
      return (
        <MemberDashboardPage
          onNavigate={navigate}
          onLogout={handleMemberLogout}
          initialMember={currentMember}
          globalSettings={settings}
        />
      );
    }

    if (currentPath === '/verify' || currentPath.startsWith('/verify/')) {
      return <VerifyPage initialMembershipId={initialVerifyId} onNavigate={navigate} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage settings={settings} />;
    }

    if (currentPath === '/news' || currentPath === '/posts') {
      return <NewsPage onNavigate={navigate} settings={settings} />;
    }

    if (currentPath === '/history' || currentPath === '/inspiration') {
      return <HistoryPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/history/')) {
      const slug = currentPath.replace('/history/', '').trim();
      return <HistoryDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage settings={settings} />;
    }

    if (currentPath === '/terms') {
      return <TermsPage settings={settings} />;
    }

    // 2. ADMIN ROUTES
    if (currentPath === '/admin-login') {
      return (
        <AdminLoginPage
          onNavigate={navigate}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          settings={settings}
        />
      );
    }

    // Protected admin routes: check admin session
    const adminToken = localStorage.getItem('pem_admin_token');
    if (!adminToken) {
      return (
        <AdminLoginPage
          onNavigate={navigate}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          settings={settings}
        />
      );
    }

    if (currentPath === '/admin-dashboard' || currentPath === '/admin/dashboard' || currentPath === '/admin') {
      return (
        <AdminDashboardPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
        />
      );
    }

    if (currentPath === '/admin/members') {
      return (
        <AdminMembersPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
        />
      );
    }

    if (currentPath === '/admin/settings') {
      return (
        <AdminSettingsPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
          onSettingsUpdated={handleSettingsUpdated}
        />
      );
    }

    if (currentPath === '/admin/sliders') {
      return (
        <AdminSlidersPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
        />
      );
    }

    if (currentPath === '/admin/history') {
      return (
        <AdminHistoryPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
        />
      );
    }

    if (currentPath === '/admin/posts' || currentPath === '/admin/content') {
      return (
        <AdminPostsPage
          onNavigate={navigate}
          admin={currentAdmin}
          onLogout={handleAdminLogout}
          settings={settings}
        />
      );
    }

    // Fallback: 404 page
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-black text-blue-950 font-serif">404</h2>
          <p className="text-sm text-slate-600">यह पृष्ठ उपलब्ध नहीं है (Page Not Found)</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs"
          >
            मुख्य पृष्ठ पर लौटें (Return Home)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Hide public Navbar & Footer on Admin pages */}
      {!isAdminRoute && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          member={currentMember}
          onMemberLogout={handleMemberLogout}
          settings={settings}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1">{renderCurrentView()}</div>

      {/* Public Footer */}
      {!isAdminRoute && (
        <Footer onNavigate={navigate} settings={settings} />
      )}
    </div>
  );
}
