import React from 'react';
import {
  ShieldCheck,
  Target,
  Eye,
  CheckCircle,
  Users,
  Award,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { OrganizationSettings } from '../types';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, settings }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>संगठन का परिचय एवं इतिहास</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-serif">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} (Paswan Ekta Manch)
          </h1>
          <p className="text-sm sm:text-base text-amber-700 font-bold uppercase tracking-wide max-w-2xl mx-auto">
            {settings?.tagline || 'एकता • समानता • सामाजिक न्याय • सेवा'}
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-serif">
              हमारा दृष्टिकोण (Our Vision)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              एक ऐसा सुदृढ़, संगठित और आत्मनिर्भर समाज जहां प्रत्येक व्यक्ति को समानता, सम्मान, शिक्षा और विकास के पूर्ण अवसर प्राप्त हों। समाज से अशिक्षा, कुरीतियां और भेदभाव को समाप्त कर सामाजिक न्याय की स्थापना करना हमारा परम लक्ष्य है।
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-serif">
              हमारा संकल्प (Our Mission)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              गांव, पंचायत, प्रखंड और जिला स्तर पर युवाओं, बुद्धिजीवियों, किसानों और श्रमिकों को संगठित करना। जरूरतमंदों तक स्वास्थ्य व कानूनी सहायता पहुंचाना और समाज के स्वाभिमान को राष्ट्रीय स्तर पर स्थापित करना।
            </p>
          </div>
        </div>

        {/* Core Principles & Commitments */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-blue-950 font-serif">
              संगठन के प्रमुख उद्देश्य एवं कार्यक्षेत्र
            </h2>
            <p className="text-xs text-slate-500 mt-1">Key Objectives and Focus Areas</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">शैक्षणिक प्रोत्साहन एवं छात्र सहायता</h4>
                <p className="text-xs text-slate-600 mt-1">
                  समाज के प्रतिभावान छात्र-छात्राओं को उच्च शिक्षा, प्रतियोगी परीक्षाओं एवं छात्रवृत्ति के लिए निःशुल्क मार्गदर्शन प्रदान करना।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">युवा नेतृत्व एवं स्वरोजगार</h4>
                <p className="text-xs text-slate-600 mt-1">
                  युवाओं में नेतृत्व कौशल विकसित करना, कौशल विकास प्रशिक्षण (Skill Training) और सरकारी ऋण योजनाओं से जोड़ना।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">कानूनी एवं सामाजिक सुरक्षा</h4>
                <p className="text-xs text-slate-600 mt-1">
                  किसी भी उत्पीड़न, अत्याचार या अनैतिक शोषण की स्थिति में प्रभावित परिवार को विधिक एवं सामाजिक संरक्षण उपलब्ध कराना।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">पारदर्शिता एवं डिजिटल सदस्यता</h4>
                <p className="text-xs text-slate-600 mt-1">
                  पूर्णतः ऑनलाइन, निःशुल्क और QR कोड सत्यापित पहचान प्रणाली से प्रत्येक सदस्य को मंच का वैध अंग बनाना।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles in Paswan Ekta Manch */}
        <div className="bg-gradient-to-br from-blue-950 to-indigo-950 text-white p-8 rounded-3xl border border-amber-500 shadow-md space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              संगठन की संरचना (Organizational Roles)
            </span>
            <h3 className="text-2xl font-bold font-serif">
              सदस्यता पद एवं दायित्व
            </h3>
            <p className="text-xs text-slate-300">
              प्रत्येक सदस्य अपनी रुचि और सामर्थ्य के अनुसार संगठन में सक्रिय भूमिका निभा सकता है:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900">
            <div className="bg-white p-5 rounded-2xl border-t-4 border-amber-500 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">Social Worker (समाज सेवी)</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  समाज सेवा, जन-जागरण, रक्तदान शिविर, और स्थानीय स्तर पर सहायता कार्यों में सक्रिय सहभागिता निभाने वाले निष्ठावान साथी।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-900">
                भूमि स्तर पर सेवा
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-t-4 border-blue-600 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 font-bold mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">Sahayak (सहायक)</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  संगठनात्मक समन्वय, सदस्यता अभियानों के संचालन और प्रशासनिक व तकनीकी सहयोग में सहायता प्रदान करने वाले सदस्य।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-900">
                संगठन संवर्धन
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-t-4 border-amber-600 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-900 font-bold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">Adhyaksh (अध्यक्ष / संयोजक)</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  प्रखंड, जिला अथवा क्षेत्रीय स्तर पर संगठन की बैठकों, कार्यक्रमों और दिशानिर्देशों का नेतृत्व करने वाले मार्गदर्शक।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-900">
                नेतृत्व एवं निर्णय
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('/membership-registration')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-md transition inline-flex items-center space-x-2"
            >
              <span>आज ही निःशुल्क सदस्यता फॉर्म भरें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
