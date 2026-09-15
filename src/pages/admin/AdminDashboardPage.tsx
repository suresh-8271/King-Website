import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertCircle,
  Newspaper,
} from 'lucide-react';
import { AdminUser, Member, OrganizationSettings } from '../../types';
import { getAdminStats, getAdminMembers, updateMemberStatus } from '../../lib/api';
import { AdminNav } from '../../components/AdminNav';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings,
}) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active_slides: 0,
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, membersData] = await Promise.all([
        getAdminStats(),
        getAdminMembers({ page: 1, limit: 6, sort: 'newest' }),
      ]);
      setStats(statsData);
      setRecentMembers(membersData.members);
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to load statistics' });
      if (e.message?.includes('Unauthorized') || e.message?.includes('expired')) {
        onLogout();
        onNavigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    let reason: string | undefined = undefined;
    if (status === 'REJECTED') {
      const input = window.prompt('कृपया अस्वीकृति का कारण दर्ज करें (Rejection Reason):', 'दस्तावेज़/विवरण अपूर्ण');
      if (input === null) return; // User cancelled
      reason = input.trim();
    }

    try {
      setActionLoadingId(id);
      await updateMemberStatus(id, status, reason);
      setMsg({
        type: 'success',
        text: `सदस्य स्थिति सफलतापूर्वक अपडेट की गई: ${status}`,
      });
      await loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Error updating status' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <AdminNav
        currentPath="/admin-dashboard"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={settings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top welcome banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-blue-950 font-serif">
              प्रशासक नियंत्रण डैशबोर्ड (Executive Overview)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              पासवान एकता मंच के सदस्यों, आवेदनों एवं डिजिटल आईडी कार्ड्स का संपूर्ण अवलोकन
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>डेटा रीफ्रेश करें</span>
          </button>
        </div>

        {/* Notifications */}
        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Members */}
          <div
            onClick={() => onNavigate('/admin/members')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                कुल पंजीकृत सदस्य (Total)
              </span>
              <span className="text-3xl font-black text-blue-950 font-serif block mt-1">
                {stats.total}
              </span>
              <span className="text-[11px] text-blue-800 font-semibold mt-1 inline-flex items-center">
                सदस्य सूची देखें <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
          </div>

          {/* Pending Members */}
          <div
            onClick={() => onNavigate('/admin/members?status=PENDING')}
            className="bg-white p-6 rounded-3xl border-2 border-amber-400 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                सत्यापन लंबित (Pending)
              </span>
              <span className="text-3xl font-black text-amber-600 font-serif block mt-1">
                {stats.pending}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-flex items-center">
                सत्यापन करें <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </div>

          {/* Approved Members */}
          <div
            onClick={() => onNavigate('/admin/members?status=APPROVED')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                स्वीकृत सदस्य (Approved)
              </span>
              <span className="text-3xl font-black text-emerald-600 font-serif block mt-1">
                {stats.approved}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-flex items-center">
                आईडी कार्ड्स सक्रिय <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
          </div>

          {/* Rejected Members */}
          <div
            onClick={() => onNavigate('/admin/members?status=REJECTED')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider block">
                अस्वीकृत (Rejected)
              </span>
              <span className="text-3xl font-black text-red-600 font-serif block mt-1">
                {stats.rejected}
              </span>
              <span className="text-[11px] text-red-700 font-semibold mt-1 inline-flex items-center">
                विवरण देखें <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center">
              <XCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 rounded-3xl border border-amber-400 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif text-amber-300">
              त्वरित प्रशासनिक क्रियाएं (Administrative Shortcuts)
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              संस्था सेटिंग्स, होमपेज बैनर या सदस्य आवेदनों का तुरंत प्रबंधन करें
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('/admin/posts')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>पोस्ट प्रबंधन ({stats.total_posts || 0} पोस्ट्स)</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/members')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/20"
            >
              पूर्ण सदस्य तालिका
            </button>
            <button
              onClick={() => onNavigate('/admin/settings')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
            >
              संस्था सेटिंग्स एवं हस्ताक्षर
            </button>
            <button
              onClick={() => onNavigate('/admin/sliders')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
            >
              स्लाइडर फोटो प्रबंधन ({stats.active_slides} सक्रिय)
            </button>
          </div>
        </div>

        {/* Post Management Quick Access Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                पोस्ट एवं समाचार प्रबंधन (Content & Post Management)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                वेबसाइट पर प्रकाशित होने वाले समाचार, फोटो, रंगीन बोल्ड शीर्षक और सूचनाएं बनाएं या संपादित करें।
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {stats.published_posts || 0} प्रकाशित (Live)
                </span>
                <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  {stats.draft_posts || 0} ड्राफ्ट (Draft)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin/posts')}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center space-x-2 shrink-0"
          >
            <span>पोस्ट प्रबंधित करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-blue-950 font-serif">
                हाल के पंजीकरण आवेदन (Recent Registrations)
              </h3>
              <p className="text-xs text-slate-500">नवीनतम सदस्यता आवेदनों की स्थिति एवं त्वरित कार्रवाई</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/members')}
              className="text-xs font-bold text-blue-900 hover:text-amber-600 flex items-center space-x-1"
            >
              <span>सभी सदस्य देखें ({stats.total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">फोटो</th>
                  <th className="py-3.5 px-4">सदस्य विवरण</th>
                  <th className="py-3.5 px-4">सदस्यता संख्या / पद</th>
                  <th className="py-3.5 px-4">जिला / राज्य</th>
                  <th className="py-3.5 px-4">स्थिति (Status)</th>
                  <th className="py-3.5 px-4 text-right">त्वरित कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recentMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      कोई सदस्य उपलब्ध नहीं है।
                    </td>
                  </tr>
                ) : (
                  recentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <img
                          src={member.photo_url || '/default-assets/logo.svg'}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                        <div className="text-[11px] text-slate-500">पिता: {member.father_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">मो: +91 {member.mobile}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-blue-900">{member.membership_id}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{member.district}</div>
                        <div className="text-[11px] text-slate-500">{member.state}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            member.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : member.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onNavigate(`/verify/${member.membership_id}`)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center"
                          title="View Public Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {member.status === 'PENDING' && (
                          <>
                            <button
                              disabled={actionLoadingId === member.id}
                              onClick={() => handleQuickStatus(member.id, 'APPROVED')}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition inline-flex items-center"
                              title="Approve Member"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={actionLoadingId === member.id}
                              onClick={() => handleQuickStatus(member.id, 'REJECTED')}
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition inline-flex items-center"
                              title="Reject Member"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
