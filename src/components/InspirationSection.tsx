import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Shield, Award, Users, Sparkles } from 'lucide-react';
import { HistorySection } from '../types';
import { getHistorySections } from '../lib/api';

interface InspirationSectionProps {
  onNavigate: (path: string) => void;
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({ onNavigate }) => {
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getHistorySections()
      .then((data) => {
        if (isMounted) {
          setSections(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load history sections:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getCardTheme = (slug: string) => {
    switch (slug) {
      case 'ambedkar':
        return {
          tag: 'संविधान निर्माता एवं सामाजिक न्याय',
          icon: Award,
          borderColor: 'border-blue-300 hover:border-blue-600',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
          btnBg: 'bg-blue-900 hover:bg-blue-800 text-white',
        };
      case 'chauharmal':
        return {
          tag: 'लोक-नायक एवं स्वाभिमान के प्रतीक',
          icon: Shield,
          borderColor: 'border-amber-300 hover:border-amber-600',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'paswan':
        return {
          tag: 'पद्म भूषण एवं जननायक',
          icon: Sparkles,
          borderColor: 'border-emerald-300 hover:border-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          btnBg: 'bg-emerald-800 hover:bg-emerald-700 text-white',
        };
      default:
        return {
          tag: 'सामाजिक चेतना एवं समग्र उत्थान',
          icon: Users,
          borderColor: 'border-indigo-300 hover:border-indigo-600',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          btnBg: 'bg-indigo-900 hover:bg-indigo-800 text-white',
        };
    }
  };

  return (
    <section id="inspiration-section" className="py-16 bg-gradient-to-b from-slate-50 via-amber-50/30 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-200 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>हमारा गौरवशाली इतिहास एवं प्रेरणास्रोत</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
            हमारे प्रेरणास्रोत और समाज
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-blue-800 to-amber-500 mx-auto mt-3 mb-4 rounded-full"></div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            महामानवों के विचार, लोक-नायक का शौर्य, जनसरोकारों की विरासत और सामाजिक एकता का संकल्प—यही पासवान एकता मंच के संगठन का मूल आधार है।
          </p>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse">
                <div className="w-full h-52 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6 mb-5"></div>
                <div className="h-10 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((item) => {
              const theme = getCardTheme(item.slug);
              const ThemeIcon = theme.icon;

              return (
                <div
                  key={item.id}
                  id={`card-${item.slug}`}
                  className={`bg-white rounded-2xl border ${theme.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group`}
                >
                  {/* Image / Graphic Canvas */}
                  <div className="relative h-56 w-full bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center p-2">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs flex items-center space-x-1 ${theme.badgeBg}`}>
                        <ThemeIcon className="w-3 h-3" />
                        <span>{theme.tag}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-grow justify-between bg-white">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 font-serif line-clamp-1 mb-1 group-hover:text-blue-900 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-700 mb-3 line-clamp-1">
                        {item.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 font-sans">
                        {item.short_intro}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => onNavigate(`/history/${item.slug}`)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors duration-150 ${theme.btnBg}`}
                      >
                        <span>विस्तार से पढ़ें (Read More)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner with Quick Navigation */}
        <div className="mt-12 bg-blue-950 rounded-2xl p-6 sm:p-8 text-white border-2 border-amber-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              पासवान एकता मंच • वैचारिक अधिष्ठान
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-serif">
              "शिक्षा, संगठन, स्वाभिमान और सामाजिक समरसता"
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
              हमारे समाज के इतिहास, महापुरुषों के संघर्ष और सामाजिक उत्थान के कार्यक्रमों के बारे में विस्तृत जानकारी प्राप्त करें।
            </p>
          </div>
          <button
            onClick={() => onNavigate('/history')}
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>समस्त इतिहास एवं आलेख देखें</span>
          </button>
        </div>
      </div>
    </section>
  );
};
