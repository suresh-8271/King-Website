import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Shield,
  FileText,
  Camera,
} from 'lucide-react';
import { AdminUser, OrganizationSettings } from '../../types';
import { getAdminSettings, updateAdminSettings, uploadImage } from '../../lib/api';
import { AdminNav } from '../../components/AdminNav';

interface AdminSettingsPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
  onSettingsUpdated: (updated: OrganizationSettings) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings: initialSettings,
  onSettingsUpdated,
}) => {
  const [formData, setFormData] = useState<OrganizationSettings>({
    org_name: '',
    org_name_hindi: '',
    tagline: '',
    logo_url: '',
    contact_number: '',
    email: '',
    address: '',
    whatsapp_group_link: '',
    authorized_person_name: '',
    authorized_person_designation: '',
    signature_url: '',
    org_qr_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload states
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        setFormData(data);
      })
      .catch((err) => {
        console.error('Error fetching settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'logo_url' | 'signature_url' | 'org_qr_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldKey);
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, [fieldKey]: url }));
    } catch (err: unknown) {
      const e = err as Error;
      alert('Upload failed: ' + e.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      setSaving(true);
      const updated = await updateAdminSettings(formData);
      setFormData(updated);
      onSettingsUpdated(updated);
      setMsg({
        type: 'success',
        text: 'संस्था सेटिंग्स सफलतापूर्वक अपडेट की गईं और पोर्टल पर लागू हो चुकी हैं।',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Settings update failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen">
        <AdminNav
          currentPath="/admin/settings"
          onNavigate={onNavigate}
          admin={admin}
          onLogout={onLogout}
          settings={initialSettings}
        />
        <div className="py-20 text-center text-sm font-bold text-slate-500">सेटिंग्स लोड हो रही हैं...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      <AdminNav
        currentPath="/admin/settings"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={initialSettings}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-black text-blue-950 font-serif">
            संगठन सेटिंग्स (Organization Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            यहाँ किए गए परिवर्तन तुरंत पूरे पोर्टल (हेडर, फुटर, डिजिटल आईडी कार्ड, संपर्क पृष्ठ आदि) पर प्रभावी होंगे।
          </p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{msg.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: IDENTITY & BRANDING */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-blue-950 font-serif border-b border-slate-200 pb-3 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>1. पहचान एवं ब्रांडिंग (Identity & Branding)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  संगठन का नाम (हिन्दी में) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.org_name_hindi}
                  onChange={(e) => setFormData({ ...formData, org_name_hindi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-serif"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  संगठन का नाम (अंग्रेजी में) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">ध्येय वाक्य (Tagline)</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            {/* Logo, Signature, QR upload blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Logo */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-bold text-slate-700 block">संगठन लोगो (Logo)</span>
                <div className="w-20 h-20 mx-auto rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.logo_url || '/default-assets/logo.svg'}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-[11px] cursor-pointer hover:bg-blue-800 transition">
                  <Upload className="w-3 h-3 mr-1 text-amber-400" />
                  <span>{uploadingField === 'logo_url' ? 'अपलोड...' : 'लोगो बदलें'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo_url')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Signature */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  आईडी कार्ड हस्ताक्षर (Signature)
                </span>
                <div className="w-28 h-16 mx-auto rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.signature_url || '/default-assets/signature.svg'}
                    alt="Signature"
                    className="w-full h-full object-contain"
                  />
                </div>
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-[11px] cursor-pointer hover:bg-blue-800 transition">
                  <Upload className="w-3 h-3 mr-1 text-amber-400" />
                  <span>{uploadingField === 'signature_url' ? 'अपलोड...' : 'हस्ताक्षर बदलें'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'signature_url')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Org QR / Donation / Info QR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  संगठन QR / सहयोग QR
                </span>
                <div className="w-20 h-20 mx-auto rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.org_qr_url || '/default-assets/logo.svg'}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-[11px] cursor-pointer hover:bg-blue-800 transition">
                  <Upload className="w-3 h-3 mr-1 text-amber-400" />
                  <span>{uploadingField === 'org_qr_url' ? 'अपलोड...' : 'QR बदलें'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'org_qr_url')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: AUTHORIZED SIGNATORY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-blue-950 font-serif border-b border-slate-200 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>2. अधिकृत हस्ताक्षरकर्ता (Authorized Signatory on ID Card)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  अधिकृत व्यक्ति का नाम *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorized_person_name}
                  onChange={(e) => setFormData({ ...formData, authorized_person_name: e.target.value })}
                  placeholder="उदा. राम विलास पासवान / राष्ट्रीय अध्यक्ष"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  पदनाम (Designation) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorized_person_designation}
                  onChange={(e) =>
                    setFormData({ ...formData, authorized_person_designation: e.target.value })
                  }
                  placeholder="उदा. राष्ट्रीय अध्यक्ष / Rashtriya Adhyaksh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACT & SOCIAL CHANNELS */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-blue-950 font-serif border-b border-slate-200 pb-3 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>3. संपर्क विवरण एवं व्हाट्सएप ग्रुप (Public Contact Info)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">हेल्पलाइन फोन नंबर (वैकल्पिक)</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="10 अंकों का मोबाइल नंबर (जब उपलब्ध हो)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">आधिकारिक ईमेल *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="paswanektamanchpakribarama@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">कार्यालय का पूरा पता *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Village: AT Pakri, Post: Pakribarama, District: Nawada, State: Bihar, Country: India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1.5 text-emerald-800">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Group Invite Link</span>
                </label>
                <input
                  type="url"
                  value={formData.whatsapp_group_link}
                  onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
                  placeholder="व्हाट्सएप ग्रुप आमंत्रण लिंक यहाँ दर्ज करें (उदा. https://chat.whatsapp.com/...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  यहाँ आधिकारिक व्हाट्सएप ग्रुप लिंक जोड़ें अथवा बदलें। लिंक खाली रहने पर वेबसाइट पर व्हाट्सएप बटन स्वतः छिपा रहेगा।
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-950 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-white font-black text-sm shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-60 border-2 border-amber-400"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'सहेजा जा रहा है...' : 'सभी सेटिंग्स सहेजें (Save All Settings)'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
