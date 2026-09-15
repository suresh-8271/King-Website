import React from 'react';
import { BookOpen } from 'lucide-react';
import { OrganizationSettings } from '../types';

interface TermsPageProps {
  settings: OrganizationSettings | null;
}

export const TermsPage: React.FC<TermsPageProps> = ({ settings }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <div className="border-b border-slate-200 pb-4 text-center">
          <BookOpen className="w-12 h-12 text-blue-900 mx-auto mb-2" />
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif">
            नियम एवं शर्तें (Terms & Conditions)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} • आधिकारिक नियमावली
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">1. सदस्यता की शर्तें</h2>
          <p>
            पासवान एकता मंच की सदस्यता पूर्णतः निःशुल्क (FREE) है। सदस्यता प्राप्त करने वाले प्रत्येक व्यक्ति से अपेक्षा की जाती है कि वह संगठन के संविधान, सामाजिक समरसता और राष्ट्रीय एकता के सिद्धांतों के अनुरूप आचरण करेगा।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">2. पहचान पत्र (ID Card) का उपयोग</h2>
          <p>
            जारी किया गया डिजिटल पहचान पत्र केवल संगठन के सदस्य के रूप में आपकी पहचान को प्रमाणित करता है। यह किसी भी प्रकार का सरकारी पहचान पत्र (जैसे आधार कार्ड, वोटर आईडी अथवा ड्राइविंग लाइसेंस) का विकल्प नहीं है।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">3. सदस्यता रद्दीकरण का अधिकार</h2>
          <p>
            यदि कोई सदस्य संगठन विरोधी गतिविधियों, असामाजिक आचरण अथवा फर्जी दस्तावेजों के माध्यम से सदस्यता प्राप्त करने का दोषी पाया जाता है, तो संगठन के राष्ट्रीय नेतृत्व अथवा प्रशासक को बिना पूर्व सूचना के उसकी सदस्यता तत्काल प्रभाव से निरस्त (Reject/Cancel) करने का पूर्ण अधिकार होगा।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">4. क्षेत्राधिकार</h2>
          <p>
            किसी भी प्रकार के विवाद की स्थिति में न्यायिक क्षेत्राधिकार संगठन के पंजीकृत कार्यालय (नवादा, बिहार) के अंतर्गत रहेगा।
          </p>
        </section>
      </div>
    </div>
  );
};
