import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { OrganizationSettings } from '../types';

interface PrivacyPolicyPageProps {
  settings: OrganizationSettings | null;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ settings }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <div className="border-b border-slate-200 pb-4 text-center">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-2" />
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif">
            गोपनीयता नीति (Privacy Policy)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} • अंतिम अद्यतन: 2026
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">1. परिचय एवं उद्देश्य</h2>
          <p>
            {settings?.org_name || 'Paswan Ekta Manch'} (पासवान एकता मंच) अपने सदस्यों की व्यक्तिगत जानकारी की सुरक्षा और गोपनीयता के प्रति पूर्णतः संकल्पबद्ध है। यह नीति स्पष्ट करती है कि सदस्यता पंजीकरण और आईडी कार्ड निर्माण के दौरान एकत्र की गई जानकारी का प्रबंधन कैसे किया जाता है।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">2. एकत्र की जाने वाली सूचनाएं</h2>
          <p>सदस्यता पंजीकरण हेतु केवल आवश्यक मूलभूत व्यक्तिगत विवरण जैसे:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>सदस्य का पूरा नाम एवं पिता का नाम</li>
            <li>सक्रिय मोबाइल नंबर</li>
            <li>स्थायी पता, जिला एवं राज्य</li>
            <li>पहचान पत्र हेतु पासपोर्ट आकार की फोटो</li>
            <li>चयनित पद (Social Worker, Sahayak, Adhyaksh)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">3. सार्वजनिक सत्यापन एवं डेटा सुरक्षा</h2>
          <p>
            सदस्य के डिजिटल पहचान पत्र (ID Card) पर मुद्रित QR कोड सार्वजनिक रूप से केवल यह प्रमाणित करता है कि व्यक्ति संगठन का वास्तविक एवं अनुमोदित सदस्य है। सार्वजनिक सत्यापन पृष्ठ पर सदस्य का पूर्ण पता, मोबाइल नंबर अथवा अन्य संवेदनशील डेटा कभी भी प्रदर्शित नहीं किया जाता।
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blue-950 font-serif">4. डेटा का गैर-व्यावसायिक उपयोग</h2>
          <p>
            संगठन किसी भी परिस्थिति में अपने सदस्यों के डेटा को किसी तीसरे पक्ष (Third Party) या व्यावसायिक विज्ञापन एजेंसियों को नहीं बेचता और न ही साझा करता है। यह डेटा केवल संगठनात्मक समन्वय, जनकल्याणकारी सूचनाओं के आदान-प्रदान और पहचान सत्यापन हेतु उपयोग किया जाता है।
          </p>
        </section>
      </div>
    </div>
  );
};
