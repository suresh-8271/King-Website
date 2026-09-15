import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Camera,
  Download,
} from 'lucide-react';
import { AdminUser, Member, MemberRole, MemberStatus, OrganizationSettings } from '../../types';
import {
  getAdminMembers,
  updateMemberStatus,
  updateMemberDetails,
  deleteMember,
  uploadImage,
} from '../../lib/api';
import { AdminNav } from '../../components/AdminNav';
import { DigitalIdCard } from '../../components/DigitalIdCard';

interface AdminMembersPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
  initialStatusFilter?: string;
}

export const AdminMembersPage: React.FC<AdminMembersPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings,
  initialStatusFilter,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Messages
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    father_name: '',
    mobile: '',
    address: '',
    district: '',
    state: '',
    role: 'Social Worker' as MemberRole,
    photo_url: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getAdminMembers({
        page,
        limit: 10,
        search: search.trim(),
        status: statusFilter === 'ALL' ? undefined : (statusFilter as MemberStatus),
        role: roleFilter === 'ALL' ? undefined : (roleFilter as MemberRole),
        sort: 'newest',
      });
      setMembers(res.members);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Error fetching members' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleStatusChange = async (id: string, newStatus: MemberStatus) => {
    let reason: string | undefined = undefined;
    if (newStatus === 'REJECTED') {
      const input = window.prompt('अस्वीकृति का कारण दर्ज करें (Rejection Reason):', 'अमान्य अथवा अपूर्ण दस्तावेज');
      if (input === null) return;
      reason = input.trim();
    }

    try {
      await updateMemberStatus(id, newStatus, reason);
      setMsg({
        type: 'success',
        text: `स्थिति सफलतापूर्वक अपडेट की गई: ${newStatus}`,
      });
      fetchMembers();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to update status' });
    }
  };

  const handleDelete = async (member: Member) => {
    const confirm = window.confirm(
      `क्या आप वाकई सदस्य "${member.name}" (${member.membership_id}) को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती!`
    );
    if (!confirm) return;

    try {
      await deleteMember(member.id);
      setMsg({ type: 'success', text: `सदस्य ${member.membership_id} को हटा दिया गया।` });
      fetchMembers();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to delete member' });
    }
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      father_name: member.father_name,
      mobile: member.mobile,
      address: member.address,
      district: member.district,
      state: member.state,
      role: member.role,
      photo_url: member.photo_url || '',
    });
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingEditPhoto(true);
      const url = await uploadImage(file);
      setEditFormData((prev) => ({ ...prev, photo_url: url }));
    } catch (err: unknown) {
      const e = err as Error;
      alert('Photo upload failed: ' + e.message);
    } finally {
      setUploadingEditPhoto(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setSavingEdit(true);
      await updateMemberDetails(editingMember.id, {
        name: editFormData.name.trim(),
        father_name: editFormData.father_name.trim(),
        mobile: editFormData.mobile.replace(/\D/g, '').slice(-10),
        address: editFormData.address.trim(),
        district: editFormData.district.trim(),
        state: editFormData.state.trim(),
        role: editFormData.role,
        photo_url: editFormData.photo_url,
      });

      setMsg({ type: 'success', text: 'सदस्य का विवरण सफलतापूर्वक अपडेट किया गया।' });
      setEditingMember(null);
      fetchMembers();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Error updating member details' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      <AdminNav
        currentPath="/admin/members"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={settings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-blue-950 font-serif">
                सदस्य प्रबंधन (Member Directory)
              </h1>
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {totalCount} रिकॉर्ड
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              सभी पंजीकृत सदस्यों की सूची, सत्यापन, संशोधन, पहचान पत्र एवं प्रबंधन
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => {
                setPage(1);
                fetchMembers();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('/membership-registration')}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
            >
              + नया सदस्य जोड़ें (New Member)
            </button>
          </div>
        </div>

        {/* Message Banner */}
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

        {/* Search and Filters Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="नाम, मोबाइल, सदस्यता संख्या (PEM2026...) या जिला खोजें..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition"
            >
              खोजें (Search)
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-700">स्थिति फ़िल्टर:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                    statusFilter === st
                      ? 'bg-blue-950 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-300 mx-2" />

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">पद (Role):</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none"
              >
                <option value="ALL">सभी पद (All Roles)</option>
                <option value="Social Worker">Social Worker</option>
                <option value="Sahayak">Sahayak</option>
                <option value="Adhyaksh">Adhyaksh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">फोटो</th>
                  <th className="py-3.5 px-4">सदस्य विवरण</th>
                  <th className="py-3.5 px-4">सदस्यता संख्या / पद</th>
                  <th className="py-3.5 px-4">संपर्क व पता</th>
                  <th className="py-3.5 px-4">स्थिति (Status)</th>
                  <th className="py-3.5 px-4">पंजीकरण तिथि</th>
                  <th className="py-3.5 px-4 text-right">प्रबंधन क्रियाएं</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      डेटा लोड हो रहा है...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      कोई सदस्य रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <img
                          src={member.photo_url || '/default-assets/logo.svg'}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                        <div className="text-[11px] text-slate-500">पिता: {member.father_name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-900 text-xs">
                          {member.membership_id}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {member.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-mono text-slate-900 font-semibold">+91 {member.mobile}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={member.address}>
                          {member.district}, {member.state}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
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
                        {member.rejection_reason && (
                          <div className="text-[10px] text-red-600 mt-0.5 truncate max-w-[140px]" title={member.rejection_reason}>
                            कारण: {member.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString('hi-IN')
                          : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* View Modal */}
                        <button
                          onClick={() => setViewingMember(member)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition inline-flex items-center"
                          title="View Digital ID / Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center"
                          title="Edit Member Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Approve Button */}
                        {member.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(member.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition inline-flex items-center"
                            title="Approve Member"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reject Button */}
                        {member.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(member.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition inline-flex items-center"
                            title="Reject Member"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(member)}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition inline-flex items-center"
                          title="Delete Member Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              कुल <strong>{totalCount}</strong> सदस्य • पृष्ठ <strong>{page}</strong> / <strong>{totalPages}</strong>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>पिछला</span>
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition flex items-center space-x-1"
              >
                <span>अगला</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: VIEW MEMBER & ID CARD */}
        {viewingMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-8">
              <button
                onClick={() => setViewingMember(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  सदस्य पहचान पत्र पूर्वावलोकन (Preview)
                </span>
                <h3 className="text-xl font-black text-blue-950 font-serif">
                  {viewingMember.name} ({viewingMember.membership_id})
                </h3>
              </div>

              {/* Digital ID Card Preview */}
              <div className="flex justify-center">
                <DigitalIdCard member={viewingMember} settings={settings} />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setViewingMember(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT MEMBER DETAILS */}
        {editingMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
              <button
                onClick={() => setEditingMember(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  सदस्य विवरण संशोधन (Edit Member Record)
                </span>
                <h3 className="text-xl font-black text-blue-950 font-serif">
                  {editingMember.membership_id} (सुरक्षित आईडी अपरिवर्तनीय है)
                </h3>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                {/* Photo change in edit */}
                <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-400 bg-white shrink-0">
                    <img
                      src={editFormData.photo_url || '/default-assets/logo.svg'}
                      alt="Edit Photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      फोटो बदलें (Update Member Photo)
                    </label>
                    <label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs cursor-pointer hover:bg-blue-800 transition space-x-1">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>{uploadingEditPhoto ? 'अपलोड हो रहा है...' : 'नई फोटो चुनें'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">पिता का नाम (Father’s Name) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.father_name}
                      onChange={(e) => setEditFormData({ ...editFormData, father_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">मोबाइल नंबर (Mobile) *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={editFormData.mobile}
                      onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">पद / भूमिका (Role) *</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as MemberRole })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Social Worker">Social Worker</option>
                      <option value="Sahayak">Sahayak</option>
                      <option value="Adhyaksh">Adhyaksh</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">स्थायी पता (Address) *</label>
                    <textarea
                      rows={2}
                      required
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">जिला (District) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.district}
                      onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">राज्य (State) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold disabled:opacity-60 shadow-xs"
                  >
                    {savingEdit ? 'सहेजा जा रहा है...' : 'परिवर्तन सहेजें (Save Changes)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
