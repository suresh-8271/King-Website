import React, { useEffect, useState, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Tag,
  Palette,
} from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';
import { AdminUser, OrganizationSettings, Post } from '../../types';
import {
  getAdminPosts,
  createAdminPost,
  updateAdminPost,
  toggleAdminPostStatus,
  deleteAdminPost,
  resetAdminPosts,
  uploadImage,
} from '../../lib/api';

interface AdminPostsPageProps {
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
}

const PRESET_COLORS = [
  { name: 'काला / गहरा (Black/Slate)', value: '#0f172a' },
  { name: 'शाही नीला (Royal Blue)', value: '#1e40af' },
  { name: 'गहरा लाल (Crimson Red)', value: '#dc2626' },
  { name: 'शुभ हरा (Emerald Green)', value: '#16a34a' },
  { name: 'केसरिया (Saffron Amber)', value: '#d97706' },
  { name: 'बैंगनी (Deep Purple)', value: '#7e22ce' },
];

const PRESET_CATEGORIES = [
  'संगठन समाचार',
  'शैक्षणिक अभियान',
  'सामाजिक सम्मेलन',
  'महत्वपूर्ण सूचना',
  'युवा एवं रोजगार',
  'प्रेस विज्ञप्ति',
];

export const AdminPostsPage: React.FC<AdminPostsPageProps> = ({
  onNavigate,
  admin,
  onLogout,
  settings,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTitleColor, setFormTitleColor] = useState('#0f172a');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('संगठन समाचार');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formPublishDate, setFormPublishDate] = useState(new Date().toISOString().split('T')[0]);

  // Preview Modal state
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getAdminPosts();
      setPosts(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'पोस्ट लोड करने में त्रुटि हुई।' });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormTitleColor('#0f172a');
    setFormContent('');
    setFormImageUrl('');
    setFormCategory('संगठन समाचार');
    setFormCustomCategory('');
    setFormStatus('published');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormTitleColor(post.title_color || '#0f172a');
    setFormContent(post.content);
    setFormImageUrl(post.image_url || '');
    if (PRESET_CATEGORIES.includes(post.category)) {
      setFormCategory(post.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('अन्य');
      setFormCustomCategory(post.category);
    }
    setFormStatus(post.status);
    setFormPublishDate(post.published_at ? post.published_at.split('T')[0] : new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'फ़ाइल का आकार 5MB से कम होना चाहिए।');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      setFormImageUrl(imageUrl);
      showNotification('success', 'फोटो सफलतापूर्वक अपलोड हो गई है!');
    } catch (err: any) {
      showNotification('error', err.message || 'फोटो अपलोड करने में विफलता हुई।');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showNotification('error', 'कृपया पोस्ट का शीर्षक / हेडिंग अवश्य दर्ज करें।');
      return;
    }

    const finalCategory = formCategory === 'अन्य' && formCustomCategory.trim()
      ? formCustomCategory.trim()
      : formCategory;

    const payload = {
      title: formTitle.trim(),
      title_color: formTitleColor || '#0f172a',
      content: formContent,
      image_url: formImageUrl.trim(),
      category: finalCategory,
      status: formStatus,
      published_at: formPublishDate,
      author_name: admin?.name || admin?.username || 'एडमिनिस्ट्रेटर',
    };

    try {
      setSaving(true);
      if (editingPost) {
        await updateAdminPost(editingPost.id, payload);
        showNotification('success', 'पोस्ट सफलतापूर्वक अपडेट कर दी गई है!');
      } else {
        await createAdminPost(payload);
        showNotification('success', 'नया पोस्ट सफलतापूर्वक बना दिया गया है!');
      }
      closeModal();
      await loadPosts();
    } catch (err: any) {
      showNotification('error', err.message || 'पोस्ट सहेजने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await toggleAdminPostStatus(post.id, newStatus);
      showNotification(
        'success',
        newStatus === 'published' ? 'पोस्ट सार्वजनिक कर दी गई है (Published)!' : 'पोस्ट ड्राफ्ट में बदल दी गई है (Draft)!'
      );
      await loadPosts();
    } catch (err: any) {
      showNotification('error', err.message || 'स्थिति बदलने में त्रुटि हुई।');
    }
  };

  const handleDeletePost = async (post: Post) => {
    const confirmDelete = window.confirm(`क्या आप वाकई इस पोस्ट को हटाना चाहते हैं?\n"${post.title}"`);
    if (!confirmDelete) return;

    try {
      await deleteAdminPost(post.id);
      showNotification('success', 'पोस्ट सफलतापूर्वक हटा दी गई है।');
      await loadPosts();
    } catch (err: any) {
      showNotification('error', err.message || 'पोस्ट हटाने में त्रुटि हुई।');
    }
  };

  const handleResetDefaults = async () => {
    const confirmReset = window.confirm('क्या आप पोस्ट्स को प्रारंभिक डिफ़ॉल्ट डेटा पर रीसेट करना चाहते हैं?');
    if (!confirmReset) return;

    try {
      setLoading(true);
      await resetAdminPosts();
      showNotification('success', 'डिफ़ॉल्ट पोस्ट्स पुनः लोड कर दिए गए हैं।');
      await loadPosts();
    } catch (err: any) {
      showNotification('error', err.message || 'रीसेट में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const allCategories = Array.from(new Set(posts.map((p) => p.category)));
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      <AdminNav
        currentPath="/admin/posts"
        onNavigate={onNavigate}
        admin={admin}
        onLogout={onLogout}
        settings={settings}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Top Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Newspaper className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                  पोस्ट एवं समाचार प्रबंधन (Post Management)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  वेबसाइट पर प्रकाशित होने वाले समाचार, सामाजिक कार्यक्रम, सूचनाएं और प्रेस विज्ञप्ति प्रबंधित करें।
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/news')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>वेबसाइट पर देखें</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm transition shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>नया पोस्ट बनाएं (New Post)</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold">कुल पोस्ट्स (Total)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{posts.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-700 font-semibold">सार्वजनिक (Published)</p>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-2xl font-black text-emerald-800 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-700 font-semibold">ड्राफ्ट (Draft)</p>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-2xl font-black text-amber-800 mt-1">{draftCount}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm">
            <p className="text-xs text-blue-700 font-semibold">कुल श्रेणियां (Categories)</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{allCategories.length}</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="शीर्षक या विवरण से खोजें (Search posts)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी ({posts.length})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'published' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                प्रकाशित ({publishedCount})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ड्राफ्ट ({draftCount})
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">सभी श्रेणियां (All Categories)</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Content Listing */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold text-sm">पोस्ट लोड हो रही हैं...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">कोई पोस्ट नहीं मिली</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              आपके खोज मापदंड से मेल खाती कोई पोस्ट उपलब्ध नहीं है, या अभी तक कोई पोस्ट नहीं बनाई गई है।
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>पहली पोस्ट बनाएं</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
              >
                {/* Post Image Container */}
                <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <Newspaper className="w-10 h-10 mb-1 opacity-50" />
                      <span className="text-xs">कोई फोटो नहीं (No Photo)</span>
                    </div>
                  )}

                  {/* Status badge on top corner */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${
                        post.status === 'published'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {post.status === 'published' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>प्रकाशित (Live)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>ड्राफ्ट (Draft)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Post Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta info */}
                    <div className="flex items-center text-xs text-slate-500 mb-2 space-x-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.published_at || post.created_at.split('T')[0]}</span>
                      </span>
                      {post.author_name && (
                        <span>• {post.author_name}</span>
                      )}
                    </div>

                    {/* ALWAYS BOLD Heading with Custom Title Color */}
                    <h3
                      className="text-base sm:text-lg font-black leading-snug line-clamp-2 mb-2 font-serif"
                      style={{ color: post.title_color || '#0f172a' }}
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      {/* Toggle publish button */}
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title={post.status === 'published' ? 'ड्राफ्ट में बदलें' : 'वेबसाइट पर लाइव करें'}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                          post.status === 'published'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {post.status === 'published' ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span className="hidden sm:inline">ड्राफ्ट करें</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">प्रकाशित करें</span>
                          </>
                        )}
                      </button>

                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewPost(post)}
                        title="पोस्ट पूर्वावलोकन (Preview)"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">देखें</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center space-x-1"
                        title="संपादित करें (Edit)"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">एडिट</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info & Reset option */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            पासवान एकता मंच पोस्ट मैनेजमेंट सिस्टम — सभी शीर्षक डिफ़ॉल्ट रूप से <strong>बोल्ड (BOLD)</strong> रहते हैं और चुने गए रंग में प्रदर्शित होते हैं।
          </p>
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-1 text-slate-600 hover:text-red-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट पोस्ट्स रीसेट करें</span>
          </button>
        </div>
      </main>

      {/* ========================================================= */}
      {/* CREATE / EDIT POST MODAL */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black font-serif">
                  {editingPost ? 'पोस्ट संपादित करें (Edit Post)' : 'नया पोस्ट बनाएं (Create New Post)'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-700/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePost} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* 1. Post Heading / Title */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  पोस्ट का शीर्षक / हेडिंग (Heading / Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पासवान एकता मंच द्वारा निःशुल्क छात्रवृत्ति शिविर..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                  <span>ℹ️ वेबसाइट पर यह शीर्षक सदैव <strong>बोल्ड (BOLD)</strong> अक्षरों में प्रदर्शित होगा।</span>
                </p>
              </div>

              {/* 2. Heading Color Selector */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Palette className="w-4 h-4 text-blue-700" />
                    <span>शीर्षक का रंग चुनें (Title Color Selector)</span>
                  </label>
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
                    style={{ color: formTitleColor, borderColor: formTitleColor }}
                  >
                    {formTitleColor}
                  </span>
                </div>

                {/* Preset Color Swatches */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormTitleColor(color.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        formTitleColor.toLowerCase() === color.value.toLowerCase()
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full shadow-inner border border-black/10 mb-1"
                        style={{ backgroundColor: color.value }}
                      ></span>
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">
                        {color.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center space-x-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-600 font-semibold">कस्टम रंग चुनें:</label>
                    <input
                      type="color"
                      value={formTitleColor}
                      onChange={(e) => setFormTitleColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={formTitleColor}
                    onChange={(e) => setFormTitleColor(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[11px] text-slate-500">(कोई भी रंग कोड डालें)</span>
                </div>

                {/* Real-time Bold Title Preview */}
                {formTitle && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      लाइव शीर्षक पूर्वावलोकन (Live Heading Preview):
                    </p>
                    <p
                      className="text-base font-black leading-snug font-serif"
                      style={{ color: formTitleColor }}
                    >
                      {formTitle}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Photo / Image Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  पोस्ट का फोटो (Photo / Image Upload)
                </label>

                {/* Image Preview Box */}
                {formImageUrl ? (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-300 bg-black/5 max-h-56 flex items-center justify-center">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="max-h-56 w-full object-contain bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition"
                      title="फोटो हटाएं"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white p-6 rounded-2xl text-center cursor-pointer transition mb-3"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      कंप्यूटर या मोबाइल से फोटो चुनें (Click to upload photo)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP (अधिकतम 5MB)</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'अपलोड हो रहा है...' : 'डिवाइस से नई फोटो चुनें'}</span>
                  </button>

                  <span className="text-xs text-slate-400">या</span>

                  <input
                    type="text"
                    placeholder="फोटो का यूआरएल (Image URL)..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 4. Category & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="अन्य">अन्य (कस्टम श्रेणी)</option>
                  </select>

                  {formCategory === 'अन्य' && (
                    <input
                      type="text"
                      placeholder="अपनी श्रेणी का नाम लिखें..."
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                    प्रकाशन तिथि (Publish Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* 5. Post Content / Description */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  पोस्ट का विवरण / मुख्य सामग्री (Post Content / Description)
                </label>
                <textarea
                  rows={6}
                  placeholder="पोस्ट का सम्पूर्ण समाचार, विवरण अथवा संदेश यहाँ लिखें..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  नोट: सामग्री सामान्य फॉन्ट में प्रदर्शित होगी तथा पैराग्राफ स्वतः संरक्षित रहेंगे।
                </p>
              </div>

              {/* 6. Status Selection (Publish vs Draft) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  प्रकाशन स्थिति (Post Status)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('published')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-bold transition ${
                      formStatus === 'published'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>तुरंत प्रकाशित करें (Publish Live)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('draft')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-bold transition ${
                      formStatus === 'draft'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <EyeOff className="w-4 h-4 text-amber-600" />
                    <span>ड्राफ्ट के रूप में सहेजें (Save as Draft)</span>
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'सहेज रहे हैं...' : editingPost ? 'अपडेट करें (Save Changes)' : 'पोस्ट बनाएं (Create Post)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POST PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <Eye className="w-4 h-4" />
                <span>सार्वजनिक पूर्वावलोकन (Public Preview)</span>
              </span>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Category & Date */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-lg">
                  {previewPost.category}
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{previewPost.published_at || previewPost.created_at.split('T')[0]}</span>
                </span>
              </div>

              {/* ALWAYS BOLD Heading with Custom Title Color */}
              <h2
                className="text-xl sm:text-2xl font-black leading-snug mb-4 font-serif"
                style={{ color: previewPost.title_color || '#0f172a' }}
              >
                {previewPost.title}
              </h2>

              {/* Photo */}
              {previewPost.image_url && (
                <div className="rounded-2xl overflow-hidden mb-5 border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src={previewPost.image_url}
                    alt={previewPost.title}
                    className="w-full max-h-96 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Content */}
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {previewPost.content}
              </div>

              {/* Status Note */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>स्थिति: {previewPost.status === 'published' ? 'सार्वजनिक' : 'ड्राफ्ट'}</span>
                <span>लेखक: {previewPost.author_name || 'एडमिन'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
