import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Share2,
  Printer,
  Calendar,
  CheckCircle,
  Award,
  Shield,
  Sparkles,
  Users,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { HistorySection } from '../types';
import { getHistorySectionBySlug, getHistorySections } from '../lib/api';

interface HistoryDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const HistoryDetailPage: React.FC<HistoryDetailPageProps> = ({ slug, onNavigate }) => {
  const [section, setSection] = useState<HistorySection | null>(null);
  const [allSections, setAllSections] = useState<HistorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    Promise.all([
      getHistorySectionBySlug(slug),
      getHistorySections(),
    ])
      .then(([current, all]) => {
        setSection(current);
        setAllSections(all);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading history detail:', err);
        setError('इस आलेख को लोड करने में असमर्थ। कृपया पुनः प्रयास करें।');
        setLoading(false);
      });
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: section?.title || 'पासवान एकता मंच इतिहास एवं प्रेरणास्रोत',
        text: section?.short_intro || '',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getSlugIcon = (s: string) => {
    switch (s) {
      case 'ambedkar':
        return Award;
      case 'chauharmal':
        return Shield;
      case 'paswan':
        return Sparkles;
      default:
        return Users;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium text-sm">आलेख एवं ऐतिहासिक विवरण लोड हो रहा है...</p>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">आलेख प्राप्त नहीं हुआ</h2>
        <p className="text-slate-600 mb-6">{error || 'यह पृष्ठ उपलब्ध नहीं है।'}</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"
        >
          मुख्य पृष्ठ पर वापस जाएं
        </button>
      </div>
    );
  }

  const CurrentIcon = getSlugIcon(section.slug);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb & Navigation Bar */}
      <div className="bg-blue-950 text-white border-b border-blue-900 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-blue-200">
            <button onClick={() => onNavigate('/')} className="hover:text-amber-400 transition">
              होम
            </button>
            <span>/</span>
            <button onClick={() => onNavigate('/history')} className="hover:text-amber-400 transition">
              इतिहास एवं प्रेरणास्रोत
            </button>
            <span>/</span>
            <span className="text-amber-400 font-semibold truncate max-w-xs">{section.title}</span>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>मुख्य पृष्ठ (Back)</span>
          </button>
        </div>
      </div>

      {/* Quick switcher tabs between the 4 sections */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            {allSections.map((item) => {
              const Icon = getSlugIcon(item.slug);
              const isActive = item.slug === section.slug;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(`/history/${item.slug}`)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.title.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Article */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-10 relative">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Image Graphic */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900/90 rounded-2xl p-2 border-2 border-amber-400/80 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
                  <CurrentIcon className="w-3.5 h-3.5" />
                  <span>{section.category}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif text-white tracking-tight leading-tight">
                  {section.title}
                </h1>
                <p className="text-sm sm:text-base text-amber-300 font-semibold mt-2">
                  {section.subtitle}
                </p>

                {/* Meta actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6 pt-6 border-t border-blue-800/80 text-xs">
                  <div className="flex items-center space-x-1.5 text-blue-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>पासवान एकता मंच आधिकारिक अभिलेख</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      onClick={handleShare}
                      className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium flex items-center space-x-1 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copied ? 'लिंक कॉपी हो गया!' : 'शेयर करें (Share)'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium flex items-center space-x-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>प्रिंट (Print)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Short Intro Lead */}
          <div className="p-6 sm:p-8 bg-amber-50/60 border-b border-amber-200/60">
            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic">
              "{section.short_intro}"
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-10 lg:p-12 space-y-6">
            {/* Special Oral History Note for Baba Chauharmal */}
            {section.slug === 'chauharmal' && (
              <div className="bg-amber-100/70 border-l-4 border-amber-600 p-4 rounded-r-xl text-amber-950 text-xs sm:text-sm leading-relaxed mb-6">
                <p className="font-bold flex items-center mb-1">
                  <Shield className="w-4 h-4 mr-1 text-amber-700" />
                  <span>सांस्कृतिक एवं लोक-परंपरा स्पष्टीकरण (Oral Heritage Clarification):</span>
                </p>
                <p>
                  बाबा चौहरमल जी से संबंधित ऐतिहासिक प्रसंग सदियों से चली आ रही लोक-मान्यताओं (लोक-गीतों, बिरहा एवं लोक-गाथाओं) और समुदाय की मौखिक परंपरा पर आधारित हैं। पासवान एकता मंच इसे समाज के आत्मसम्मान, साहस, समरसता और सांस्कृतिक पहचान के गौरव के रूप में श्रद्धापूर्वक प्रस्तुत करता है।
                </p>
              </div>
            )}

            {/* Render formatted content with Markdown-like styling */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-5 font-sans">
              {section.full_content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();

                // Headings
                if (trimmed.startsWith('### ')) {
                  const headingText = trimmed.replace('### ', '');
                  return (
                    <div key={index} className="pt-4 border-t border-slate-100 first:border-0 first:pt-0">
                      <h2 className="text-lg sm:text-xl font-bold text-blue-950 font-serif flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0"></span>
                        <span>{headingText}</span>
                      </h2>
                    </div>
                  );
                }

                if (trimmed.startsWith('## ')) {
                  const headingText = trimmed.replace('## ', '');
                  return (
                    <div key={index} className="pt-6 border-t-2 border-slate-200">
                      <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-serif">
                        {headingText}
                      </h2>
                    </div>
                  );
                }

                // Blockquotes
                if (trimmed.startsWith('> ')) {
                  const quoteText = trimmed.replace(/^>\s*/, '');
                  return (
                    <blockquote
                      key={index}
                      className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-800 text-blue-950 italic font-medium my-4 text-sm sm:text-base"
                    >
                      {quoteText.replace(/\*/g, '')}
                    </blockquote>
                  );
                }

                // Bullet Lists
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
                  return (
                    <ul key={index} className="space-y-2.5 my-3 pl-2">
                      {items.map((item, i) => {
                        const clean = item.replace(/^[-*]\s*/, '');
                        return (
                          <li key={i} className="flex items-start text-slate-700 text-sm sm:text-base">
                            <span className="text-amber-600 font-bold mr-2 mt-1 shrink-0">•</span>
                            <div>
                              {clean.split('**').map((chunk, ci) =>
                                ci % 2 === 1 ? (
                                  <strong key={ci} className="text-slate-950 font-semibold">
                                    {chunk}
                                  </strong>
                                ) : (
                                  chunk
                                )
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // Numbered list
                if (/^[१२३४५६७८९\d]\.\s*/.test(trimmed)) {
                  const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
                  return (
                    <ol key={index} className="space-y-2.5 my-3 pl-2">
                      {items.map((item, i) => {
                        return (
                          <li key={i} className="flex items-start text-slate-700 text-sm sm:text-base">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-1 shrink-0" />
                            <div>
                              {item.split('**').map((chunk, ci) =>
                                ci % 2 === 1 ? (
                                  <strong key={ci} className="text-slate-950 font-semibold">
                                    {chunk}
                                  </strong>
                                ) : (
                                  chunk
                                )
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  );
                }

                // Regular Paragraph
                return (
                  <p key={index} className="text-slate-700 leading-relaxed text-sm sm:text-base">
                    {trimmed.split('**').map((chunk, ci) =>
                      ci % 2 === 1 ? (
                        <strong key={ci} className="text-slate-950 font-semibold">
                          {chunk}
                        </strong>
                      ) : (
                        chunk
                      )
                    )}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Member Registration Callout */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-6 sm:p-8 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black font-serif">
                समाज के उत्थान और एकता अभियान से जुड़ें
              </h3>
              <p className="text-xs sm:text-sm font-medium mt-1">
                पासवान एकता मंच की निःशुल्क सदस्यता ग्रहण करें और डिजिटल पहचान पत्र (ID Card) प्राप्त करें।
              </p>
            </div>
            <button
              onClick={() => onNavigate('/membership-registration')}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>निःशुल्क सदस्यता लें</span>
            </button>
          </div>
        </div>

        {/* Read Next: Other 3 Sections */}
        <div className="mt-12">
          <h3 className="text-xl font-black text-slate-900 font-serif mb-6 flex items-center">
            <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
            <span>अन्य प्रेरणास्रोत एवं समाज का विवरण</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {allSections
              .filter((s) => s.slug !== section.slug)
              .map((other) => {
                const OtherIcon = getSlugIcon(other.slug);
                return (
                  <div
                    key={other.id}
                    onClick={() => onNavigate(`/history/${other.slug}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-36 bg-slate-900 rounded-xl mb-4 p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={other.image_url}
                          alt={other.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                        />
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-700 mb-1">
                        <OtherIcon className="w-3 h-3" />
                        <span>{other.category}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 font-serif line-clamp-1 group-hover:text-blue-900 transition">
                        {other.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {other.short_intro}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-amber-600 transition">
                      <span>पढ़ें (Read)</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </article>
    </div>
  );
};
