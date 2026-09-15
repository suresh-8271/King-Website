import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  Calendar,
  Search,
  ArrowRight,
  Share2,
  Check,
  X,
  Tag,
  BookOpen,
  Filter,
} from 'lucide-react';
import { OrganizationSettings, Post } from '../types';
import { getPublicPosts } from '../lib/api';

interface NewsPageProps {
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate, settings }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'समाचार लोड करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['सभी', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'सभी' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleShare = async (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = window.location.href;
    const shareText = `${post.title}\n\n${post.content.slice(0, 150)}...\n\nपढ़ें: ${settings?.org_name_hindi || 'पासवान एकता मंच'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${post.title}\n${shareUrl}`);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-900/80 text-amber-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-blue-700/50">
            <Newspaper className="w-4 h-4" />
            <span>आधिकारिक समाचार एवं प्रेस विज्ञप्ति</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-white mb-3">
            समाचार, सूचना एवं ताजा गतिविधियां
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} के सामाजिक अभियानों, शैक्षणिक कार्यशालाओं, 
            युवा सम्मेलनों एवं महत्वपूर्ण घोषणाओं की अधिकृत जानकारी।
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="समाचार या कीवर्ड खोजें (Search news)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold text-sm">ताज़ा समाचार लोड हो रहे हैं...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center my-8">
            <p className="font-bold">{error}</p>
            <button
              onClick={loadPosts}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              पुनः प्रयास करें
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm my-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">कोई समाचार उपलब्ध नहीं है</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery || selectedCategory !== 'सभी'
                ? 'आपके खोज मापदंड से संबंधित कोई पोस्ट नहीं मिली। कृपया अन्य कीवर्ड या श्रेणी चुनें।'
                : 'शीघ्र ही नए समाचार एवं गतिविधियां प्रकाशित की जाएंगी।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
              >
                {/* Photo container */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <Newspaper className="w-10 h-10 mb-1 opacity-50" />
                      <span className="text-xs">पासवान एकता मंच</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-900/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date */}
                    <div className="flex items-center text-xs text-slate-500 mb-2.5 space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.published_at || post.created_at.split('T')[0]}</span>
                    </div>

                    {/* ALWAYS BOLD Heading with Custom Title Color */}
                    <h2
                      className="text-base sm:text-lg font-black leading-snug line-clamp-2 mb-2 font-serif group-hover:opacity-90 transition"
                      style={{ color: post.title_color || '#0f172a' }}
                    >
                      {post.title}
                    </h2>

                    {/* Post Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Footer action bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
                      <span>पूरा पढ़ें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <button
                      onClick={(e) => handleShare(post, e)}
                      title="शेयर करें"
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                    >
                      {copiedId === post.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* FULL POST DETAIL MODAL */}
      {/* ========================================================= */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-300 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedPost.published_at || selectedPost.created_at.split('T')[0]}</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              {/* ALWAYS BOLD Heading with Custom Title Color */}
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug mb-5 font-serif"
                style={{ color: selectedPost.title_color || '#0f172a' }}
              >
                {selectedPost.title}
              </h1>

              {/* Photo Display */}
              {selectedPost.image_url && (
                <div className="rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full max-h-[450px] object-contain bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Full Content */}
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal space-y-4">
                {selectedPost.content}
              </div>

              {/* Author & Org Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-4">
                <div>
                  <p className="font-bold text-slate-700">
                    जारीकर्ता: {selectedPost.author_name || settings?.org_name_hindi || 'पासवान एकता मंच'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {settings?.tagline || 'एकता • समानता • सामाजिक न्याय • सेवा'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(selectedPost)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl transition text-xs"
                  >
                    {copiedId === selectedPost.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>शेयर करें (Share)</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition text-xs"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
