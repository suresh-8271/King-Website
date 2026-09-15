import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Award,
  Shield,
  Sparkles,
  Users,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { HistorySection } from '../types';
import { getHistorySections } from '../lib/api';

interface HistoryPageProps {
  onNavigate: (path: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getHistorySections()
      .then((data) => {
        setSections(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load history sections:', err);
        setLoading(false);
      });
  }, []);

  const getCardIcon = (slug: string) => {
    switch (slug) {
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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-14 px-4 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-4 border border-amber-400/40">
            <BookOpen className="w-4 h-4" />
            <span>इतिहास • स्वाभिमान • प्रेरणास्रोत</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight">
            हमारे प्रेरणास्रोत और समाज
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-blue-200 mt-4 max-w-3xl mx-auto leading-relaxed font-sans">
            बोधिसत्व डॉ. भीमराव अंबेडकर के संवैधानिक आदर्श, वीर शिरोमणि बाबा चौहरमल का शौर्य व स्वाभिमान, जननायक श्री रामविलास पासवान की जनसेवा और समाज के समग्र विकास का सशक्त संकल्प।
          </p>
          <div className="flex justify-center items-center space-x-2 mt-6 text-xs text-blue-300">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-amber-300 transition flex items-center space-x-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>मुख्य पृष्ठ</span>
            </button>
            <span>•</span>
            <span className="text-amber-400 font-semibold">इतिहास एवं प्रेरणास्रोत</span>
          </div>
        </div>
      </div>

      {/* Main Grid of the 4 Pillars */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm">सामग्री लोड हो रही है...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((item, index) => {
              const Icon = getCardIcon(item.slug);
              const isEven = index % 2 === 1;

              return (
                <div
                  key={item.id}
                  id={`history-${item.slug}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch`}>
                    {/* Visual Emblem Badge */}
                    <div className="lg:w-2/5 bg-slate-950 flex flex-col items-center justify-center p-8 relative">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900 rounded-2xl p-2 border-2 border-amber-400/80 shadow-md flex items-center justify-center">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="mt-4 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                        {item.category}
                      </span>
                    </div>

                    {/* Content Description */}
                    <div className="lg:w-3/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 mb-2">
                          <Icon className="w-4 h-4" />
                          <span>भाग {index + 1}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif leading-tight">
                          {item.title}
                        </h2>
                        <h3 className="text-sm sm:text-base font-bold text-blue-900 mt-1 mb-4">
                          {item.subtitle}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-sans mb-6">
                          {item.short_intro}
                        </p>

                        {/* Key Highlights */}
                        <div className="space-y-2 mb-6 text-xs text-slate-700">
                          {item.slug === 'ambedkar' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>प्रारूप समिति के अध्यक्ष • स्वतंत्र भारत के प्रथम विधि एवं न्याय मंत्री</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>महाड़ सत्याग्रह, महिला अधिकार (हिंदू कोड बिल) एवं भारत रत्न सम्मान</span>
                              </div>
                            </>
                          )}
                          {item.slug === 'chauharmal' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>पासवान समाज के स्वाभिमान, साहस एवं वीरता के पूज्य लोक-नायक</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>मोकामा टाल में प्रतिवर्ष विशाल मेला • सदियों पुरानी लोक-मान्यता एवं गाथा</span>
                              </div>
                            </>
                          )}
                          {item.slug === 'paswan' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>८ बार लोकसभा सांसद • हाजीपुर से ऐतिहासिक विश्व रिकॉर्ड जीत</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>मंडल आयोग, ईसीआर हाजीपुर जोनल कार्यालय, 'वन नेशन वन राशन कार्ड' एवं पद्म भूषण</span>
                              </div>
                            </>
                          )}
                          {item.slug === 'society' && (
                            <>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>"शिक्षा, एकता, सम्मान, समानता और विकास" का पंच-आदर्श</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>युवा मार्गदर्शन, महिला सशक्तिकरण, कानूनी साक्षरता व सामाजिक समरसता</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <button
                          onClick={() => onNavigate(`/history/${item.slug}`)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 group"
                        >
                          <span>पूर्ण विवरण एवं ऐतिहासिक आलेख पढ़ें</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
