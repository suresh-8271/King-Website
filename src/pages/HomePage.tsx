import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogIn,
  Search,
  ShieldCheck,
  Award,
  Users,
  HeartHandshake,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Newspaper,
  Calendar,
} from 'lucide-react';
import { OrganizationSettings, HomepageSlide, Post } from '../types';
import { InspirationSection } from '../components/InspirationSection';
import { getSlides, getPublicPosts } from '../lib/api';

interface HomePageProps {
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
  slides?: HomepageSlide[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, settings, slides: initialSlides }) => {
  const [slides, setSlides] = useState<HomepageSlide[]>(initialSlides || []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) {
      getSlides().then(setSlides).catch(() => {});
    } else {
      setSlides(initialSlides);
    }
  }, [initialSlides]);

  useEffect(() => {
    setPostsLoading(true);
    getPublicPosts({ limit: 3 })
      .then((data) => setLatestPosts(data))
      .catch((err) => console.error('Failed to fetch latest posts on homepage:', err))
      .finally(() => setPostsLoading(false));
  }, []);

  // Auto-advance slider every 6 seconds
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const prevSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SLIDER SECTION (Loaded dynamically from database) */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {slides && slides.length > 0 ? (
          <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full">
            {slides.map((slide, index) => {
              const isCurrent = index === currentSlideIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Image with Scenic Clarity & Royal Blue Overlay */}
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover object-right md:object-center transform transition-transform duration-7000 ease-out"
                  />
                  {/* Gradient: Deep royal blue on left for text readability, opening up to transparent on right so scenic illustration shines through */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 md:via-blue-950/50 to-blue-950/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40" />

                  {/* Slide Content */}
                  <div className="relative z-20 max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-5">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>राष्ट्र निर्माण एवं सामाजिक समरसता</span>
                      </div>

                      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif leading-tight tracking-tight">
                        {slide.title}
                      </h1>

                      <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-2xl font-normal">
                        {slide.subtitle}
                      </p>

                      {/* Call-to-action buttons */}
                      <div className="pt-3 flex flex-wrap gap-3.5">
                        <button
                          onClick={() => onNavigate('/membership-registration')}
                          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition flex items-center space-x-2 group"
                        >
                          <UserPlus className="w-5 h-5 text-slate-950" />
                          <span>निःशुल्क सदस्यता लें / Register</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </button>

                        <button
                          onClick={() => onNavigate('/member-login')}
                          className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm sm:text-base transition flex items-center space-x-2 backdrop-blur-xs"
                        >
                          <LogIn className="w-5 h-5 text-amber-400" />
                          <span>सदस्य लॉगिन / Login</span>
                        </button>

                        <button
                          onClick={() => onNavigate('/verify')}
                          className="px-5 py-3.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-400/30 text-blue-100 font-bold text-sm sm:text-base transition flex items-center space-x-2"
                        >
                          <Search className="w-4 h-4 text-amber-300" />
                          <span>सत्यापन / Verify ID</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs transition"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs transition"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                {/* Dots indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlideIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlideIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h1 className="text-4xl font-bold text-white">
              {settings?.org_name_hindi || 'पासवान एकता मंच'}
            </h1>
          </div>
        )}
      </section>

      {/* 2. QUICK ACTION STRIP */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white border-y border-amber-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">निःशुल्क सदस्यता</h4>
                <p className="text-xs text-slate-300">ऑनलाइन फॉर्म भरें और तुरंत सदस्यता संख्या (ID) पाएं।</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">डिजिटल पहचान पत्र (ID Card)</h4>
                <p className="text-xs text-slate-300">स्वीकृत होने पर QR कोड युक्त डिजिटल कार्ड डाउनलोड करें।</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">सार्वजनिक सत्यापन</h4>
                <p className="text-xs text-slate-300">QR स्कैन या Membership ID दर्ज कर प्रामाणिकता जांचें।</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTRODUCTION & OBJECTIVES SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Col: Narrative */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
                <span>संस्था का ध्येय एवं संकल्प</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-serif leading-tight">
                {settings?.org_name_hindi || 'पासवान एकता मंच'}: सशक्त समाज, संगठित राष्ट्र
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                पासवान एकता मंच एक गैर-राजनीतिक, समर्पित सामाजिक संस्था है जो समाज के प्रत्येक वर्ग में एकता, आपसी भाईचारा, सामाजिक न्याय, और शैक्षणिक चेतना जागृत करने हेतु निरंतर कार्यरत है।
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                हमारा मुख्य उद्देश्य समाज के युवाओं, महिलाओं और श्रमिक वर्ग को उनके अधिकारों के प्रति जागरूक करना, सरकारी जनकल्याणकारी योजनाओं का लाभ अंतिम व्यक्ति तक पहुंचाना, तथा समाज में स्वाभिमान और आत्मनिर्भरता की भावना का संचार करना है।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-semibold">100% निःशुल्क एवं पारदर्शी सदस्यता</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-semibold">सत्यापित डिजिटल QR पहचान पत्र</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-semibold">गांव और जिला स्तर पर संगठन नेटवर्क</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-semibold">सामाजिक सुरक्षा एवं सहायता प्रकोष्ठ</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition inline-flex items-center space-x-2"
                >
                  <span>विस्तृत परिचय पढ़ें / Read More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Col: Emblem & Core Pillars */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="text-center pb-6 border-b border-slate-200">
                <img
                  src={settings?.logo_url || '/default-assets/logo.svg'}
                  alt="Organization Logo"
                  className="w-24 h-24 mx-auto rounded-full border-4 border-amber-400 bg-white p-1 shadow-md mb-3"
                />
                <h3 className="text-xl font-black text-blue-950 font-serif">
                  {settings?.org_name_hindi || 'पासवान एकता मंच'}
                </h3>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                  {settings?.tagline || 'एकता • समानता • सामाजिक न्याय • सेवा'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
                  <Users className="w-8 h-8 text-blue-900 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-900">सामाजिक एकता</h4>
                  <p className="text-[11px] text-slate-500 mt-1">समाज के सभी वर्गों को एक सूत्र में पिरोना</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
                  <BookOpen className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-900">शिक्षा व मार्गदर्शन</h4>
                  <p className="text-[11px] text-slate-500 mt-1">युवाओं को उच्च शिक्षा एवं रोजगार परामर्श</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
                  <HeartHandshake className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-900">आपसी सहयोग</h4>
                  <p className="text-[11px] text-slate-500 mt-1">कठिन समय में असहायों की मदद</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
                  <Award className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-900">स्वाभिमान रक्षा</h4>
                  <p className="text-[11px] text-slate-500 mt-1">संवैधानिक अधिकारों के प्रति जागरूकता</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR HISTORY & INSPIRATION SECTION (4 Core Pillars) */}
      <InspirationSection onNavigate={onNavigate} />

      {/* 5. LATEST NEWS & POSTS SECTION */}
      <section className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-900 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5 text-blue-700" />
                <span>ताज़ा गतिविधियाँ एवं समाचार</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif text-slate-900">
                समाचार एवं सामाजिक सूचनाएं
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                पासवान एकता मंच के नवीन कार्यक्रमों, शैक्षणिक सम्मेलनों और संगठनात्मक घोषणाओं की ताज़ा जानकारी।
              </p>
            </div>

            <button
              onClick={() => onNavigate('/news')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm shrink-0"
            >
              <span>सभी समाचार देखें / View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {postsLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-semibold">ताज़ा समाचार लोड हो रहे हैं...</p>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <p className="text-sm text-slate-500 font-medium">वर्तमान में कोई समाचार प्रकाशित नहीं है।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onNavigate('/news')}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <Newspaper className="w-8 h-8 mb-1 opacity-40" />
                        <span className="text-[11px]">पासवान एकता मंच</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-xs text-slate-400 mb-2 space-x-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.published_at || post.created_at.split('T')[0]}</span>
                      </div>

                      {/* ALWAYS BOLD Heading with Custom Title Color */}
                      <h3
                        className="text-base font-black leading-snug line-clamp-2 mb-2 font-serif group-hover:opacity-90 transition"
                        style={{ color: post.title_color || '#0f172a' }}
                      >
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-600 font-normal line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                      <span className="group-hover:translate-x-1 transition flex items-center space-x-1">
                        <span>पूरा विवरण पढ़ें</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. MEMBERSHIP CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest">
            JOIN THE MOVEMENT • निःशुल्क सदस्यता अभियान 2026
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-white leading-tight">
            पासवान एकता मंच के साथ जुड़ें और समाज को नई दिशा दें
          </h2>
          <p className="text-slate-200 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            मात्र 2 मिनट में ऑनलाइन निःशुल्क पंजीकरण करें। अपनी सदस्यता आईडी सुरक्षित करें और संगठन का आधिकारिक डिजिटल पहचान पत्र प्राप्त करें।
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('/membership-registration')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5 text-slate-950" />
              <span>पंजीकरण फॉर्म खोलें (Register Now)</span>
            </button>

            <button
              onClick={() => onNavigate('/member-login')}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-base transition flex items-center space-x-2"
            >
              <LogIn className="w-5 h-5 text-amber-400" />
              <span>पहले से पंजीकृत हैं? लॉगिन करें</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. HOMEPAGE CONTACT & HELP SECTION */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              सहायता एवं संपर्क
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif">
              हमसे संपर्क करें / Get In Touch
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              सदस्यता, सत्यापन या संगठन संबंधी किसी भी जानकारी हेतु हमारे केंद्रीय कार्यालय से संपर्क करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">फोन एवं हेल्पलाइन</h4>
              <p className="text-xs text-slate-500 mt-1">सोमवार से शनिवार (सुबह 10:00 से शाम 6:00)</p>
              {settings?.contact_number ? (
                <a
                  href={`tel:${settings.contact_number}`}
                  className="mt-3 text-sm font-bold text-blue-900 hover:text-amber-600 transition"
                >
                  {settings.contact_number}
                </a>
              ) : (
                <span className="mt-3 text-xs font-medium text-slate-400">
                  शीघ्र उपलब्ध कराया जाएगा
                </span>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">ईमेल संपर्क</h4>
              <p className="text-xs text-slate-500 mt-1">आधिकारिक पत्राचार एवं शिकायत निवारण</p>
              <a
                href={`mailto:${settings?.email || 'paswanektamanchpakribarama@gmail.com'}`}
                className="mt-3 text-sm font-bold text-blue-900 hover:text-amber-600 transition break-all"
              >
                {settings?.email || 'paswanektamanchpakribarama@gmail.com'}
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">व्हाट्सएप ग्रुप</h4>
              <p className="text-xs text-slate-500 mt-1">संगठन की नियमित सूचनाओं के लिए</p>
              {settings?.whatsapp_group_link?.trim() ? (
                <a
                  href={settings.whatsapp_group_link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Our WhatsApp Group</span>
                </a>
              ) : (
                <span className="mt-3 text-xs text-slate-400">लिंक शीघ्र उपलब्ध कराया जाएगा</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
