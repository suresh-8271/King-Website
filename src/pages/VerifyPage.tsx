import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Calendar,
  MapPin,
  Award,
  RefreshCw,
} from 'lucide-react';
import { PublicVerifiedMember } from '../types';
import { verifyMember } from '../lib/api';

interface VerifyPageProps {
  initialMembershipId?: string;
  onNavigate: (path: string) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ initialMembershipId, onNavigate }) => {
  const [membershipId, setMembershipId] = useState(initialMembershipId || '');
  const [loading, setLoading] = useState(false);
  const [verifiedMember, setVerifiedMember] = useState<PublicVerifiedMember | null>(null);
  const [orgName, setOrgName] = useState<string>('Paswan Ekta Manch');
  const [orgNameHindi, setOrgNameHindi] = useState<string>('पासवान एकता मंच');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performVerification = async (idToVerify: string) => {
    const clean = idToVerify.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('कृपया सदस्यता संख्या (Membership ID) दर्ज करें।');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setVerifiedMember(null);
    setHasSearched(true);

    try {
      const data = await verifyMember(clean);
      setVerifiedMember(data.member);
      if (data.org_name) setOrgName(data.org_name);
      if (data.org_name_hindi) setOrgNameHindi(data.org_name_hindi);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || 'Invalid Membership ID. No verified member found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMembershipId) {
      setMembershipId(initialMembershipId);
      performVerification(initialMembershipId);
    }
  }, [initialMembershipId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(membershipId);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-8">
        {/* Verification Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif">
            सार्वजनिक सदस्यता सत्यापन
          </h1>
          <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
            Public Membership Verification Portal
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            पासवान एकता मंच के किसी भी सदस्य के डिजिटल पहचान पत्र (ID Card) अथवा सदस्यता संख्या की प्रामाणिकता यहाँ जांचें।
          </p>

          {/* Search Input Box */}
          <form onSubmit={handleSubmit} className="pt-3 max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  placeholder="उदा. PEM20260001"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm uppercase font-mono font-bold tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                )}
                <span>सत्यापित करें (Verify)</span>
              </button>
            </div>
          </form>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">डेटाबेस से सत्यापन हो रहा है...</p>
          </div>
        )}

        {/* ERROR / INVALID ID RESULT */}
        {!loading && hasSearched && errorMessage && (
          <div className="bg-white p-8 rounded-3xl border-2 border-red-300 shadow-md text-center space-y-3 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-red-700 font-serif">
              Invalid Membership ID. No verified member found.
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              दर्ज की गई सदस्यता संख्या हमारे आधिकारिक रिकॉर्ड में उपलब्ध नहीं है। कृपया संख्या की पुनः जांच करें अथवा संगठन से संपर्क करें।
            </p>
          </div>
        )}

        {/* VALID VERIFIED MEMBER CARD */}
        {!loading && verifiedMember && (
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in">
            {/* Top Seal Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 text-center relative border-b-2 border-amber-400">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>आधिकारिक रूप से सत्यापित / Official Verified Record</span>
              </div>
              <h2 className="text-2xl font-black font-serif text-white">{orgNameHindi}</h2>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">{orgName}</p>
            </div>

            {/* Member Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left border-b border-slate-200 pb-6">
                <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-500 bg-slate-100 shadow-sm shrink-0">
                  <img
                    src={verifiedMember.photo_url || '/default-assets/logo.svg'}
                    alt={verifiedMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 uppercase font-semibold">सदस्य का नाम</span>
                  <h3 className="text-2xl font-black text-blue-950 font-serif">
                    {verifiedMember.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                      {verifiedMember.role}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        verifiedMember.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Status: {verifiedMember.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">सदस्यता संख्या / ID</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">{verifiedMember.membership_id}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">जिला एवं राज्य</span>
                  <span className="font-semibold text-slate-800 text-sm flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{verifiedMember.district}, {verifiedMember.state}</span>
                  </span>
                </div>

                {verifiedMember.approved_at && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">स्वीकृति तिथि (Approval Date)</span>
                    <span className="font-semibold text-slate-800 text-sm flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(verifiedMember.approved_at).toLocaleDateString('hi-IN')}</span>
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">वैधता (Validity)</span>
                  <span className="font-bold text-emerald-700 text-sm flex items-center space-x-1 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{verifiedMember.validity || 'Active Life Member'}</span>
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900 text-center flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  निजता नीति के तहत सदस्य का व्यक्तिगत पता एवं मोबाइल नंबर सार्वजनिक सत्यापन में प्रदर्शित नहीं किया जाता।
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
