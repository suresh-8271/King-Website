import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  KeyRound,
  ArrowRight,
  User,
  Mail,
} from 'lucide-react';
import { getAdminStatus, loginAdmin, setupFirstAdmin } from '../lib/api';
import { AdminUser, OrganizationSettings } from '../types';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
  onAdminLoginSuccess: (admin: AdminUser) => void;
  settings: OrganizationSettings | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onAdminLoginSuccess,
  settings,
}) => {
  const [hasAdmin, setHasAdmin] = useState<boolean>(true);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Setup form state (if no admin exists)
  const [setupData, setSetupData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getAdminStatus()
      .then((data) => {
        setHasAdmin(data.hasAdmin);
      })
      .catch((err) => {
        console.error('Error checking admin status:', err);
      })
      .finally(() => {
        setCheckingStatus(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('कृपया यूज़रनेम एवं पासवर्ड दोनों दर्ज करें।');
      return;
    }

    try {
      setLoading(true);
      const res = await loginAdmin(username.trim(), password);
      onAdminLoginSuccess(res.admin);
      onNavigate('/admin-dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (setupData.password !== setupData.confirmPassword) {
      setErrorMsg('पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते।');
      return;
    }
    if (setupData.password.length < 6) {
      setErrorMsg('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    try {
      setLoading(true);
      const res = await setupFirstAdmin({
        username: setupData.username.trim(),
        name: setupData.name.trim(),
        email: setupData.email.trim(),
        password: setupData.password,
      });
      onAdminLoginSuccess(res.admin);
      onNavigate('/admin-dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Failed to initialize master admin');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="text-blue-950 font-bold text-sm">लोड हो रहा है...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen py-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Admin Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-950 to-blue-800 text-amber-400 flex items-center justify-center mx-auto shadow-md border-2 border-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest">
              OFFICIAL CONTROL PANEL
            </span>
            <h1 className="text-2xl font-black text-blue-950 font-serif mt-1">
              प्रशासक पोर्टल (Admin Portal)
            </h1>
            <p className="text-xs text-slate-500">
              {settings?.org_name_hindi || 'पासवान एकता मंच'} • सुरक्षित नियंत्रण कक्ष
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* FIRST TIME SETUP FORM IF NO ADMIN */}
          {!hasAdmin ? (
            <form onSubmit={handleSetup} className="space-y-4 text-left pt-2">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>प्रथम बार सेटअप: कृपया मास्टर व्यवस्थापक खाता बनाएं।</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-900" />
                  <span>यूज़रनेम (Username) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={setupData.username}
                  onChange={(e) => setSetupData({ ...setupData, username: e.target.value })}
                  placeholder="यूज़रनेम दर्ज करें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-900" />
                  <span>व्यवस्थापक का नाम (Admin Name) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={setupData.name}
                  onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                  placeholder="व्यवस्थापक का नाम दर्ज करें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-blue-900" />
                  <span>ईमेल (Email) *</span>
                </label>
                <input
                  type="email"
                  required
                  value={setupData.email}
                  onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                  placeholder="paswanektamanchpakribarama@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-900" />
                  <span>पासवर्ड (Password) *</span>
                </label>
                <input
                  type="password"
                  required
                  value={setupData.password}
                  onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  पासवर्ड की पुष्टि (Confirm Password) *
                </label>
                <input
                  type="password"
                  required
                  value={setupData.confirmPassword}
                  onChange={(e) => setSetupData({ ...setupData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>{loading ? 'खाता बन रहा है...' : 'मास्टर खाता बनाएं एवं लॉगिन करें'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD ADMIN LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 text-left pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-900" />
                  <span>प्रशासक यूज़रनेम (Username)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="यूज़रनेम दर्ज करें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-900" />
                  <span>पासवर्ड (Password)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{loading ? 'सत्यापित हो रहा है...' : 'प्रशासक लॉगिन करें (Login)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200 text-xs">
            <button
              onClick={() => onNavigate('/')}
              className="text-slate-500 hover:text-blue-900 font-semibold"
            >
              ← वापस मुख्य पृष्ठ पर जाएं (Back to Home)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
