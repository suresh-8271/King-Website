import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { OrganizationSettings } from '../types';

interface ContactPageProps {
  settings: OrganizationSettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [formSent, setFormSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            संपर्क एवं सहायता केंद्र
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 font-serif">
            {settings?.org_name_hindi || 'पासवान एकता मंच'} से संपर्क करें
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            संगठन, सदस्यता, डिजिटल आईडी सत्यापन अथवा सामाजिक सहयोग हेतु हमारे केंद्रीय कार्यालय अथवा हेल्पलाइन पर संपर्क करें।
          </p>
        </div>

        {/* Dynamic Settings Driven Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">फोन एवं हेल्पलाइन</h3>
            <p className="text-xs text-slate-500">सोमवार से शनिवार (सुबह 10 बजे से शाम 6 बजे)</p>
            {settings?.contact_number ? (
              <a
                href={`tel:${settings.contact_number}`}
                className="text-base font-bold text-blue-900 hover:text-amber-600 transition"
              >
                {settings.contact_number}
              </a>
            ) : (
              <span className="text-sm font-medium text-slate-400">
                शीघ्र उपलब्ध कराया जाएगा
              </span>
            )}
          </div>

          {/* Email Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">आधिकारिक ईमेल</h3>
            <p className="text-xs text-slate-500">पत्राचार एवं सुझाव हेतु</p>
            <a
              href={`mailto:${settings?.email || 'paswanektamanchpakribarama@gmail.com'}`}
              className="text-sm font-bold text-blue-900 hover:text-amber-600 transition break-all"
            >
              {settings?.email || 'paswanektamanchpakribarama@gmail.com'}
            </a>
          </div>

          {/* WhatsApp Group Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">व्हाट्सएप ग्रुप</h3>
            <p className="text-xs text-slate-500">संगठन के आधिकारिक ग्रुप से सीधे जुड़ें</p>
            {settings?.whatsapp_group_link?.trim() ? (
              <a
                href={settings.whatsapp_group_link.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition space-x-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Our WhatsApp Group</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400">लिंक शीघ्र अपडेट किया जाएगा</span>
            )}
          </div>
        </div>

        {/* Address and Interactive Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Office Address (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-8 rounded-3xl border border-amber-500 shadow-md space-y-6">
            <h3 className="text-xl font-bold font-serif text-white border-b border-white/20 pb-3">
              केंद्रीय कार्यालय / Head Office
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">कार्यालय का पता:</span>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {settings?.address || 'Village: AT Pakri, Post: Pakribarama, District: Nawada, State: Bihar, Country: India'}
                  </p>
                </div>
              </div>

              {settings?.whatsapp_group_link?.trim() && (
                <div className="pt-2 border-t border-white/10">
                  <span className="block text-slate-300 font-semibold mb-2 uppercase text-[10px]">आधिकारिक कम्युनिटी:</span>
                  <a
                    href={settings.whatsapp_group_link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Join Our WhatsApp Group</span>
                  </a>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">कार्यालय समय:</span>
                  <p className="text-sm font-medium text-white">
                    सोमवार - शनिवार: 10:00 AM - 06:00 PM
                  </p>
                  <p className="text-slate-300 text-[11px] mt-0.5">रविवार: विशेष बैठकों हेतु आरक्षित</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">प्रशासनिक अधिकारी:</span>
                  <p className="text-sm font-bold text-amber-300">
                    {settings?.authorized_person_name}
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    {settings?.authorized_person_designation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-blue-950 font-serif border-b border-slate-200 pb-3">
              संदेश भेजें / Send an Inquiry
            </h3>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">संदेश प्राप्त हुआ!</h4>
                <p className="text-xs text-emerald-800">
                  धन्यवाद {contactName}, आपका संदेश हमारे प्रतिनिधि तक पहुंच गया है। शीघ्र ही आपसे संपर्क किया जाएगा।
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  नया संदेश लिखें
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">आपका नाम (Your Name) *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="आपका पूरा नाम दर्ज करें"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">मोबाइल नंबर (Mobile Number) *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">संदेश / विवरण (Message) *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="अपनी समस्या या संदेश यहाँ विस्तार से लिखें..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>संदेश भेजें (Submit Message)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
