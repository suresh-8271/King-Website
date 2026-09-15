import React, { useState } from 'react';
import {
  LogIn,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Phone,
  CreditCard,
} from 'lucide-react';
import { loginMember } from '../lib/api';
import { Member, OrganizationSettings } from '../types';

interface MemberLoginPageProps {
  onNavigate: (path: string) => void;
  onLoginSuccess: (member: Member) => void;
  settings: OrganizationSettings | null;
}

export const MemberLoginPage: React.FC<MemberLoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
  settings,
}) => {
  const [mobile, setMobile] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanId = membershipId.trim().toUpperCase();

    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!cleanId) {
      setErrorMsg('कृपया अपनी सदस्यता संख्या (Membership ID) दर्ज करें। (उदा. PEM20260001)');
      return;
    }

    try {
      setLoading(true);
      const res = await loginMember(cleanMobile, cleanId);
      onLoginSuccess(res.member);
      onNavigate('/member-dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Invalid mobile number or membership ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-1 bg-white mx-auto shadow-sm">
            <img
              src={settings?.logo_url || '/default-assets/logo.svg'}
              alt="Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-blue-950 font-serif">
              सदस्य लॉगिन (Member Login)
            </h1>
            <p className="text-xs text-slate-500">
              {settings?.org_name_hindi || 'पासवान एकता मंच'} • डिजिटल पोर्टल
            </p>
          </div>

          {/* Pending, Approved, Rejected reassurance info */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900 leading-relaxed text-left flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span>
              पंजीकृत सदस्य (प्रक्रियाधीन / स्वीकृत / निरस्त) अपने <strong>मोबाइल नंबर</strong> एवं <strong>सदस्यता संख्या (ID)</strong> से सीधे लॉगिन कर सकते हैं।
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-blue-900" />
                <span>मोबाइल नंबर (Registered Mobile Number)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-900" />
                <span>सदस्यता संख्या (Membership ID)</span>
              </label>
              <input
                type="text"
                required
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                placeholder="उदा. PEM20260001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm uppercase font-mono tracking-wider font-semibold"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                पंजीकरण के समय प्राप्त 11 अंकों का कोड (उदा. PEM20260001)
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>{loading ? 'सत्यापित हो रहा है...' : 'डैशबोर्ड में लॉगिन करें (Login)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-600">
            अभी तक पंजीकरण नहीं कराया है?
            <button
              onClick={() => onNavigate('/membership-registration')}
              className="font-bold text-amber-700 hover:text-amber-800 ml-1.5 inline-flex items-center"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              निःशुल्क सदस्यता लें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
