import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';
import { AdminUser, HistorySection, OrganizationSettings } from '../../types';
import {
  getAdminHistorySections,
  updateAdminHistorySection,
  resetAdminHistorySections,
  uploadImage,
} from '../../lib/api';

interface AdminHistoryPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
}

export const AdminHistoryPage: React.FC<AdminHistoryPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings,
}) => {
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<HistorySection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getAdminHistorySections();
      setSections(data);
      if (data.length > 0) {
        const current = selectedId ? data.find(s => s.id === selectedId) || data[0] : data[0];
        setSelectedId(current.id);
        setFormData(current);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'आलेख लोड करने में त्रुटि' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (sec: HistorySection) => {
    setSelectedId(sec.id);
    setFormData(sec);
    setNotification(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePublished = () => {
    setFormData(prev => ({ ...prev, is_published: !prev.is_published }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      setNotification({ type: 'success', message: 'तस्वीर सफलतापूर्वक अपलोड हो गई।' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'तस्वीर अपलोड असफल' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setSaving(true);
      setNotification(null);
      const updated = await updateAdminHistorySection(selectedId, formData);
      setSections(prev => prev.map(s => (s.id === selectedId ? updated : s)));
      setFormData(updated);
      setNotification({ type: 'success', message: 'सामग्री सफलतापूर्वक सुरक्षित (Saved) कर दी गई है।' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'सुरक्षित करने में विफलता' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('क्या आप सभी चारों आलेखों को उनके मूल प्रामाणिक इतिहास सामग्री पर रीसेट करना चाहते हैं?')) {
      return;
    }

    try {
      setSaving(true);
      const reset = await resetAdminHistorySections();
      setSections(reset);
      const current = reset.find(s => s.id === selectedId) || reset[0];
      setSelectedId(current.id);
      setFormData(current);
      setNotification({ type: 'success', message: 'सभी आलेख प्रामाणिक डिफ़ॉल्ट पर रीसेट हो गए।' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'रीसेट करने में त्रुटि' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      <AdminNav
        currentPath="/admin/history"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={settings}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-amber-500 text-slate-950 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-serif">
                  इतिहास एवं प्रेरणास्रोत प्रबंधन (History & Inspiration CMS)
                </h1>
                <p className="text-xs text-slate-500">
                  डॉ. अंबेडकर, बाबा चौहरमल, श्री रामविलास पासवान और समाज चेतना की सामग्री एवं फोटो नियंत्रित करें
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('/history')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>लाइव पेज देखें</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
              title="मूल सत्यापित सामग्री बहाल करें"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>डिफ़ॉल्ट बहाल करें</span>
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center space-x-3 text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-slate-200">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-600 text-sm">सामग्री लोड हो रही है...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar list of the 4 sections */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
                  चार मुख्य आलेख (4 Sections)
                </h3>
                <div className="space-y-2">
                  {sections.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSection(item)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold truncate">
                              {item.title.split('(')[0].trim()}
                            </h4>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                              {item.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.is_published
                                ? isSelected
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-emerald-100 text-emerald-800'
                                : isSelected
                                ? 'bg-red-400 text-slate-950'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.is_published ? 'प्रकाशित' : 'छिपा हुआ'}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick guidance box */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 space-y-2">
                <p className="font-bold flex items-center">
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-amber-700" />
                  <span>संपादन दिशानिर्देश:</span>
                </p>
                <ul className="space-y-1 list-disc pl-4 text-[11px] text-amber-900">
                  <li>सत्यापित ऐतिहासिक तथ्यों एवं आदरपूर्ण भाषा का प्रयोग करें।</li>
                  <li>बाबा चौहरमल जी के प्रसंग को लोक-मान्यता एवं सांस्कृतिक विरासत के रूप में प्रस्तुत रखें।</li>
                  <li>बदलाव तुरंत वेबसाइट के होमपेज और आलेख पृष्ठ पर लाइव हो जाते हैं।</li>
                </ul>
              </div>
            </div>

            {/* Main Form Editor */}
            <div className="lg:col-span-8">
              <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                      URL Slug: /history/{formData.slug}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 font-serif">
                      {formData.title || 'शीर्षक संपादित करें'}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleTogglePublished}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border ${
                        formData.is_published
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                      }`}
                    >
                      {formData.is_published ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>प्रकाशित (Published)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-red-600" />
                          <span>अप्रकाशित (Draft/Hidden)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      शीर्षक / Title (हिंदी / English) *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      श्रेणी / Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    उप-शीर्षक / Subtitle (मुख्य पहचान/उपाधि)
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Image Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आधिकारिक तस्वीर / Image URL या फ़ाइल अपलोड
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-900 border-2 border-amber-400 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={formData.image_url || '/default-assets/logo.svg'}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        name="image_url"
                        value={formData.image_url || ''}
                        onChange={handleChange}
                        placeholder="https://... या /default-assets/ambedkar.svg"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <label className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer border border-slate-300 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? 'अपलोड हो रहा है...' : 'डिवाइस से नई फोटो चुनें'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Short Intro */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    संक्षिप्त परिचय / Short Intro (होमपेज कार्ड पर दिखने वाला विवरण)
                  </label>
                  <textarea
                    name="short_intro"
                    rows={3}
                    value={formData.short_intro || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Full Biography Content */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      विस्तृत जीवनी एवं संपूर्ण आलेख / Full Article Content (Markdown format)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      शीर्षक के लिए '### ', सूची के लिए '- ' उपयोग करें
                    </span>
                  </div>
                  <textarea
                    name="full_content"
                    rows={14}
                    value={formData.full_content || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs leading-relaxed font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/history/${formData.slug}`)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>पूर्वावलोकन (Preview)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>{saving ? 'सुरक्षित हो रहा है...' : 'परिवर्तन सुरक्षित करें (Save Changes)'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
