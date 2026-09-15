import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { AdminUser, HomepageSlide, OrganizationSettings } from '../../types';
import {
  getAdminSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  uploadImage,
  resetToDefaultSlides,
} from '../../lib/api';
import { AdminNav } from '../../components/AdminNav';

interface AdminSlidersPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
}

export const AdminSlidersPage: React.FC<AdminSlidersPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings,
}) => {
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New slide form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlideData, setNewSlideData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: 'निःशुल्क सदस्यता लें',
    button_link: '/membership-registration',
    display_order: 1,
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await getAdminSlides();
      setSlides(data);
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Error fetching slides' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleToggleActive = async (slide: HomepageSlide) => {
    try {
      await updateSlide(slide.id, { is_active: !slide.is_active });
      setMsg({
        type: 'success',
        text: `स्लाइड ${!slide.is_active ? 'सक्रिय (Enabled)' : 'निष्क्रिय (Disabled)'} की गई।`,
      });
      fetchSlides();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to update slide' });
    }
  };

  const handleDeleteSlide = async (slide: HomepageSlide) => {
    const confirm = window.confirm(`क्या आप वाकई इस स्लाइड को हटाना चाहते हैं?`);
    if (!confirm) return;

    try {
      await deleteSlide(slide.id);
      setMsg({ type: 'success', text: 'स्लाइड हटा दी गई।' });
      fetchSlides();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to delete slide' });
    }
  };

  const handleResetToDefaults = async () => {
    const confirm = window.confirm(
      'क्या आप सभी 5 आधिकारिक थीम स्लाइड (डॉ. अंबेडकर, बाबा चौहरमल, श्री रामविलास पासवान, श्री चिराग पासवान, हमारा समाज) को रीसेट करना चाहते हैं?'
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await resetToDefaultSlides();
      setMsg({
        type: 'success',
        text: 'स्लाइड्स सफलतापूर्वक 5 आधिकारिक थीम स्लाइड्स पर रीसेट हो गई हैं!',
      });
      fetchSlides();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to reset slides' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      setNewSlideData((prev) => ({ ...prev, image_url: url }));
    } catch (err: unknown) {
      const e = err as Error;
      alert('Upload failed: ' + e.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideData.image_url) {
      alert('कृपया स्लाइड हेतु बैनर फोटो अपलोड करें या URL दर्ज करें।');
      return;
    }

    try {
      setSubmitting(true);
      await createSlide(newSlideData);
      setMsg({ type: 'success', text: 'नई स्लाइड सफलतापूर्वक जोड़ दी गई!' });
      setShowAddModal(false);
      setNewSlideData({
        title: '',
        subtitle: '',
        image_url: '',
        button_text: 'निःशुल्क सदस्यता लें',
        button_link: '/membership-registration',
        display_order: slides.length + 1,
        is_active: true,
      });
      fetchSlides();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Failed to create slide' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      <AdminNav
        currentPath="/admin/sliders"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={settings}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-blue-950 font-serif">
              होमपेज स्लाइडर प्रबंधन (Slider Management)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              मुख्य पृष्ठ पर प्रदर्शित होने वाले बैनर्स, फोटो, संदेश एवं क्रम को नियंत्रित करें।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="px-3.5 py-2.5 rounded-xl bg-blue-900/10 hover:bg-blue-900/20 text-blue-900 border border-blue-900/20 font-bold text-xs transition flex items-center space-x-1.5"
              title="5 आधिकारिक थीम स्लाइड्स रीसेट करें"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-800" />
              <span>5 आधिकारिक थीम रीसेट करें (5 Official Themes)</span>
            </button>
            <button
              onClick={fetchSlides}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>नई स्लाइड जोड़ें (Add Slide)</span>
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
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm font-bold">
              स्लाइड्स लोड हो रही हैं...
            </div>
          ) : slides.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">कोई स्लाइड उपलब्ध नहीं है</h3>
              <p className="text-xs text-slate-500">ऊपर दिए गए बटन से नई स्लाइड जोड़ें।</p>
            </div>
          ) : (
            slides.map((slide) => (
              <div
                key={slide.id}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition ${
                  slide.is_active ? 'border-slate-200' : 'border-slate-300 opacity-60'
                }`}
              >
                <div>
                  {/* Image Preview */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      क्रम #{slide.display_order}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slide.is_active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {slide.is_active ? 'सक्रिय (Active)' : 'निष्क्रिय (Hidden)'}
                      </span>
                    </div>
                  </div>

                  {/* Caption & Title */}
                  <div className="p-5 space-y-2">
                    <h4 className="font-black text-blue-950 text-base font-serif line-clamp-1">
                      {slide.title || 'शीर्षक रहित'}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {slide.subtitle || 'कोई उपशीर्षक नहीं'}
                    </p>
                    {slide.button_text && (
                      <div className="pt-2 text-[11px] text-blue-900 font-semibold flex items-center space-x-1">
                        <span>बटन: {slide.button_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                      slide.is_active
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {slide.is_active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>छिपाएं</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>सक्रिय करें</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteSlide(slide)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL: ADD NEW SLIDE */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-xl font-black text-blue-950 font-serif">
                  नई होमपेज स्लाइड जोड़ें (Add Slider Image)
                </h3>
              </div>

              <form onSubmit={handleCreateSlide} className="space-y-4 text-xs">
                {/* Upload or Image Preview */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800">बैनर फोटो (Image) *</label>
                  {newSlideData.image_url && (
                    <div className="h-36 rounded-xl overflow-hidden border border-slate-200 mb-2">
                      <img
                        src={newSlideData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <label className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs cursor-pointer hover:bg-blue-800 transition space-x-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{uploadingImage ? 'अपलोड हो रहा है...' : 'फोटो फाइल चुनें'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">या नीचे सीधा URL पेस्ट करें</span>
                  </div>

                  <input
                    type="text"
                    required
                    value={newSlideData.image_url}
                    onChange={(e) => setNewSlideData({ ...newSlideData, image_url: e.target.value })}
                    placeholder="/slides/slide-ambedkar.svg or /uploads/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">मुख्य शीर्षक (Slide Title) *</label>
                  <input
                    type="text"
                    required
                    value={newSlideData.title}
                    onChange={(e) => setNewSlideData({ ...newSlideData, title: e.target.value })}
                    placeholder="उदा. सामाजिक न्याय व एकता का मजबूत संकल्प"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">उपशीर्षक / संदेश (Subtitle)</label>
                  <textarea
                    rows={2}
                    value={newSlideData.subtitle}
                    onChange={(e) => setNewSlideData({ ...newSlideData, subtitle: e.target.value })}
                    placeholder="उदा. प्रत्येक नागरिक को सम्मान, शिक्षा और विकास के पूर्ण अवसर..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">बटन का नाम (Button Text)</label>
                    <input
                      type="text"
                      value={newSlideData.button_text}
                      onChange={(e) => setNewSlideData({ ...newSlideData, button_text: e.target.value })}
                      placeholder="उदा. सदस्यता लें"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">प्रदर्शन क्रम (Order)</label>
                    <input
                      type="number"
                      min={1}
                      value={newSlideData.display_order}
                      onChange={(e) =>
                        setNewSlideData({
                          ...newSlideData,
                          display_order: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold disabled:opacity-60 shadow-xs"
                  >
                    {submitting ? 'सहेजा जा रहा है...' : 'स्लाइड प्रकाशित करें'}
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
