import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  MapPin,
  Shield,
  LogOut,
  RefreshCw,
  User,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { Member, OrganizationSettings } from '../types';
import { getMemberMe } from '../lib/api';
import { DigitalIdCard } from '../components/DigitalIdCard';

interface MemberDashboardPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  initialMember: Member | null;
  globalSettings: OrganizationSettings | null;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({
  onNavigate,
  onLogout,
  initialMember,
  globalSettings,
}) => {
  const [member, setMember] = useState<Member | null>(initialMember);
  const [settings, setSettings] = useState<OrganizationSettings | null>(globalSettings);
  const [loading, setLoading] = useState(!initialMember);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getMemberMe();
      setMember(data.member);
      if (data.settings) {
        setSettings(data.settings as unknown as OrganizationSettings);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Failed to fetch member details');
      if (e.message?.includes('expired') || e.message?.includes('Unauthorized')) {
        onLogout();
        onNavigate('/member-login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-blue-950 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span>सदस्य विवरण लोड हो रहा है... (Loading Profile)</span>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">सत्र समाप्त (Session Expired)</h2>
          <p className="text-xs text-slate-600">कृपया पुनः अपने मोबाइल और सदस्यता संख्या से लॉगिन करें।</p>
          <button
            onClick={() => onNavigate('/member-login')}
            className="px-6 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs"
          >
            लॉगिन पृष्ठ पर जाएं
          </button>
        </div>
      </div>
    );
  }

  const isApproved = member.status === 'APPROVED';
  const isPending = member.status === 'PENDING';
  const isRejected = member.status === 'REJECTED';

  const formattedRegDate = member.created_at
    ? new Date(member.created_at).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  const formattedAppDate = member.approved_at
    ? new Date(member.approved_at).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar with Member Greeting and Logout */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-200 shrink-0 shadow-sm">
              <img
                src={member.photo_url || '/default-assets/logo.svg'}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-blue-950 font-serif">
                  {member.name}
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  {member.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Membership ID: <strong className="text-blue-900 font-bold">{member.membership_id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={fetchProfile}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Refresh profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onLogout();
                onNavigate('/member-login');
              }}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center space-x-1.5 border border-red-200 ml-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>

        {/* STATUS BANNER */}
        {isPending && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 rounded-3xl shadow-md space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-serif">
                  Your membership application is pending approval.
                </h2>
                <p className="text-xs text-amber-100 font-medium">
                  आपकी सदस्यता का आवेदन सत्यापन हेतु संगठन के राष्ट्रीय/जिला प्रशासक के समक्ष विचाराधीन है।
                </p>
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded-xl text-xs text-amber-50">
              सत्यापन पूर्ण होते ही आपका डिजिटल पहचान पत्र (ID Card) डाउनलोड हेतु उपलब्ध हो जाएगा। आप अपनी सदस्यता संख्या <strong>{member.membership_id}</strong> सुरक्षित रखें।
            </div>
          </div>
        )}

        {isApproved && (
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  APPROVED MEMBER
                </div>
                <h2 className="text-lg sm:text-xl font-black font-serif">
                  सत्यापित एवं अधिकृत सदस्य
                </h2>
                <p className="text-xs text-emerald-100">
                  आपका सदस्यता आवेदन स्वीकृत कर दिया गया है। डिजिटल पहचान पत्र नीचे तैयार है।
                </p>
              </div>
            </div>

            {formattedAppDate && (
              <div className="text-right text-xs text-emerald-100 border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
                <span className="block text-[10px] uppercase text-emerald-200">स्वीकृति तिथि (Approved on)</span>
                <span className="font-bold text-white">{formattedAppDate}</span>
              </div>
            )}
          </div>
        )}

        {isRejected && (
          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 rounded-3xl shadow-md space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-serif">
                  Your membership application has been rejected.
                </h2>
                <p className="text-xs text-red-100 font-medium">
                  असुविधा के लिए खेद है, आपका सदस्यता आवेदन संगठन द्वारा निरस्त किया गया है।
                </p>
              </div>
            </div>

            {member.rejection_reason && (
              <div className="bg-black/25 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">
                  अस्वीकृति का कारण (Rejection Reason):
                </span>
                <p className="text-slate-100">{member.rejection_reason}</p>
              </div>
            )}

            <p className="text-[11px] text-red-200">
              अधिक जानकारी या पुनः समीक्षा हेतु कृपया संगठन के हेल्पलाइन नंबर पर संपर्क करें।
            </p>
          </div>
        )}

        {/* DETAILS GRID & ID CARD SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Member Profile Details Card (Left side, 5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-base text-blue-950 font-serif flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-900" />
                <span>सदस्य अभिलेख (Profile Info)</span>
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPending
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">पूरा नाम (Full Name)</span>
                <span className="text-sm font-bold text-slate-900">{member.name}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">पिता का नाम (Father’s Name)</span>
                <span className="text-sm font-semibold text-slate-800">{member.father_name}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">सदस्यता संख्या (Membership ID)</span>
                <span className="font-mono font-bold text-blue-950 text-sm">{member.membership_id}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">पद / भूमिका (Role)</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block mt-0.5">
                  {member.role}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">मोबाइल नंबर (Mobile)</span>
                <span className="text-slate-900 font-semibold flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 {member.mobile}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">स्थायी पता (Full Address)</span>
                <span className="text-slate-800 flex items-start space-x-1 mt-0.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{member.address}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">जिला (District)</span>
                  <span className="text-slate-800 font-bold">{member.district}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">राज्य (State)</span>
                  <span className="text-slate-800 font-bold">{member.state}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>पंजीकरण तिथि: {formattedRegDate}</span>
              </div>
            </div>
          </div>

          {/* Digital ID Card Section (Right side, 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-full border-b border-slate-200 pb-3 mb-6 flex justify-between items-center">
                <h3 className="font-bold text-base text-blue-950 font-serif flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-900" />
                  <span>डिजिटल सदस्यता पहचान पत्र (Digital ID Card)</span>
                </h3>
                {isApproved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    डाउनलोड हेतु तैयार
                  </span>
                )}
              </div>

              {isApproved ? (
                <DigitalIdCard member={member} settings={settings} />
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">पहचान पत्र अभी उपलब्ध नहीं है</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isPending
                      ? 'आपका सदस्यता आवेदन अभी प्रक्रियाधीन (PENDING) है। संगठन के प्रशासक द्वारा सत्यापन व अनुमोदन (Approval) के तुरंत बाद आपका डिजिटल पहचान पत्र यहाँ उपलब्ध हो जाएगा।'
                      : 'आवेदन अस्वीकृत होने के कारण पहचान पत्र जारी नहीं किया गया है।'}
                  </p>
                  {isPending && (
                    <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      सत्यापन प्रगति पर है...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
