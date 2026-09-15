import React, { useState } from 'react';
import {
  UserPlus,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  LogIn,
  Copy,
  Check,
  Camera,
} from 'lucide-react';
import { MemberRole, OrganizationSettings } from '../types';
import { registerMember, uploadImage } from '../lib/api';

interface RegistrationPageProps {
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
}

const INDIAN_STATES = [
  'Bihar',
  'Uttar Pradesh',
  'Jharkhand',
  'West Bengal',
  'Delhi NCR',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Haryana',
  'Punjab',
  'Gujarat',
  'Chhattisgarh',
  'Odisha',
  'Uttarakhand',
  'Himachal Pradesh',
  'Assam',
  'Karnataka',
  'Telangana',
  'Other',
];

const ROLES: MemberRole[] = ['Social Worker', 'Sahayak', 'Adhyaksh'];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate, settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    mobile: '',
    address: '',
    district: '',
    state: 'Bihar',
    photo_url: '',
    role: 'Social Worker' as MemberRole,
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success State
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [registeredMemberName, setRegisteredMemberName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('कृपया केवल JPG, PNG या WebP फोटो अपलोड करें। (Please select JPG or PNG image)');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('फोटो का आकार 5MB से कम होना चाहिए। (Photo must be less than 5MB)');
      return;
    }

    setErrorMsg(null);
    setSelectedPhotoFile(file);

    // Create local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto upload to server
    try {
      setUploadingPhoto(true);
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, photo_url: url }));
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Photo upload error:', e);
      setErrorMsg(e.message || 'फोटो अपलोड करने में त्रुटि हुई।');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg('कृपया अपना पूरा नाम दर्ज करें (Full Name is required).');
      return;
    }
    if (!formData.father_name.trim() || formData.father_name.trim().length < 2) {
      setErrorMsg("कृपया पिता का नाम दर्ज करें (Father's Name is required).");
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (Valid 10-digit mobile number required).');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setErrorMsg('कृपया पूरा पता दर्ज करें (Full Address is required).');
      return;
    }
    if (!formData.district.trim()) {
      setErrorMsg('कृपया जिला दर्ज करें (District is required).');
      return;
    }
    if (!formData.state.trim()) {
      setErrorMsg('कृपया राज्य चुनें (State is required).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await registerMember({
        name: formData.name.trim(),
        father_name: formData.father_name.trim(),
        mobile: cleanMobile,
        address: formData.address.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        photo_url: formData.photo_url || '/default-assets/logo.svg',
        role: formData.role,
      });

      setRegisteredId(res.membershipId);
      setRegisteredMemberName(formData.name.trim());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'पंजीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!registeredId) return;
    navigator.clipboard.writeText(registeredId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SUCCESS SCREEN
  if (registeredId) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-amber-500 shadow-xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              पंजीकरण सफल / Registration Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif">
              बधाई हो, {registeredMemberName}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              पासवान एकता मंच में आपका निःशुल्क सदस्यता आवेदन सफलतापूर्वक दर्ज कर लिया गया है।
            </p>
          </div>

          {/* Membership ID Highlight Box */}
          <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-6 rounded-2xl border-2 border-amber-400 shadow-md space-y-2">
            <p className="text-xs uppercase font-bold text-amber-300 tracking-widest">
              आपकी सदस्यता संख्या (Membership ID)
            </p>
            <div className="flex items-center justify-center space-x-3 pt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                {registeredId}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1 text-xs"
                title="Copy Membership ID"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-blue-200 mt-2">
              प्रारंभिक स्थिति (Status): <strong className="text-amber-300 font-bold">PENDING (सत्यापन प्रक्रियाधीन)</strong>
            </p>
          </div>

          {/* Warning & Instructions Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>महत्वपूर्ण निर्देश (Keep Safe):</span>
            </div>
            <p>
              1. कृपया अपनी सदस्यता संख्या (<strong>{registeredId}</strong>) को कहीं सुरक्षित लिख लें या स्क्रीनशॉट ले लें।
            </p>
            <p>
              2. आप अपने मोबाइल नंबर और इसी Membership ID की मदद से कभी भी <strong>सदस्य लॉगिन</strong> कर सकते हैं।
            </p>
            <p>
              3. संगठन के प्रशासक द्वारा सत्यापन होते ही आप अपना <strong>डिजिटल पहचान पत्र (ID Card)</strong> डाउनलोड कर सकेंगे।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('/member-login')}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>सदस्य लॉगिन करें (Member Login)</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
            >
              मुख्य पृष्ठ पर जाएं (Home)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>100% निःशुल्क सदस्यता • Free Membership 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif">
            सदस्यता पंजीकरण फॉर्म (Registration Form)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} से जुड़कर समाज सेवा, एकता और सशक्तिकरण में सहभागी बनें। सभी आवश्यक जानकारी सही-सही भरें।
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start space-x-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <h3 className="text-base font-bold text-blue-950 font-serif">
              व्यक्तिगत विवरण / Personal Information
            </h3>
            <span className="text-[11px] text-red-600 font-semibold">* सभी विवरण अनिवार्य हैं</span>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-28 rounded-xl border-2 border-dashed border-amber-500 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  <span className="text-[9px] block">फोटो नहीं चुनी</span>
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-blue-950/70 flex items-center justify-center text-white text-[10px] font-bold">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <label className="block text-xs font-bold text-slate-900">
                पासपोर्ट साइज फोटो अपलोड करें (Upload Member Photo)
              </label>
              <p className="text-[11px] text-slate-500">
                साफ चेहरा, स्पष्ट पृष्ठभूमि। JPG, PNG अधिकतम 5MB। यह फोटो आपके डिजिटल पहचान पत्र (ID Card) पर मुद्रित होगी।
              </p>
              <div className="pt-1">
                <label className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-xs transition space-x-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{photoPreview ? 'फोटो बदलें (Change Photo)' : 'फोटो चुनें (Select Photo)'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. पूरा नाम (Full Name) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा. आपका पूरा नाम (Full Name)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
              />
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                2. पिता का नाम (Father’s Name) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="पिताजी का पूरा नाम (Father's Name)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                3. मोबाइल नंबर (Mobile Number) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                10 अंकों का सक्रिय भारतीय मोबाइल नंबर (लॉगिन में उपयोगी)
              </span>
            </div>

            {/* Role/Post Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                4. पद / भूमिका (Post / Role) <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm bg-white font-medium"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block mt-1">
                विकल्प: Social Worker, Sahayak, Adhyaksh
              </span>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              5. पूरा स्थायी पता (Full Address) <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="ग्राम/मोहल्ला, पोस्ट ऑफिस, थाना, पिन कोड सहित..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
            />
          </div>

          {/* District & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                6. जिला (District) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="उदा. नवादा (Nawada)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                7. राज्य (State) <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" required defaultChecked className="mt-0.5 rounded text-blue-900" />
              <span>
                मैं प्रमाणित करता/करती हूँ कि दी गई सभी जानकारियां पूर्णतः सत्य हैं। मैं {settings?.org_name_hindi || 'पासवान एकता मंच'} के नियमों, संविधान एवं सामाजिक आदर्शों का सम्मान करूंगा/करूंगी।
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <UserPlus className="w-5 h-5 text-slate-950" />
              <span>
                {submitting ? 'पंजीकरण हो रहा है... (Submitting)' : 'निःशुल्क सदस्यता फॉर्म जमा करें (Register Now)'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            पहले से पंजीकृत सदस्य हैं?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/member-login')}
              className="font-bold text-blue-900 hover:underline"
            >
              यहाँ क्लिक कर लॉगिन करें (Member Login)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
