import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Shield,
  ChevronRight,
  Heart,
  Lock,
} from 'lucide-react';
import { OrganizationSettings } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t-4 border-amber-500 mt-auto">
      {/* Upper footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About NGO */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={settings?.logo_url || '/default-assets/logo.svg'}
                alt="Logo"
                className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white p-0.5"
              />
              <div>
                <h3 className="text-lg font-bold text-white font-serif leading-tight">
                  {settings?.org_name_hindi || 'पासवान एकता मंच'}
                </h3>
                <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase">
                  {settings?.org_name || 'PASWAN EKTA MANCH'}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              पासवान एकता मंच समाज के सर्वांगीण विकास, सामाजिक समरसता, वंचितों के उत्थान, शिक्षा और एकता के लिए कटिबद्ध एक स्वायत्त सामाजिक एवं सामुदायिक संगठन है।
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-950 text-blue-200 border border-blue-800">
                <Shield className="w-3 h-3 text-amber-400 mr-1.5" />
                पंजीकृत गैर-सरकारी सामाजिक मंच
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center">
              <span className="text-amber-400 mr-1.5">▪</span> त्वरित लिंक / Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>मुख्य पृष्ठ (Home)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>मंच का परिचय एवं उद्देश्य (About Us)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/history')}
                  className="hover:text-amber-400 transition flex items-center group text-amber-300 font-semibold"
                >
                  <ChevronRight className="w-3 h-3 text-amber-400 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>इतिहास एवं प्रेरणास्रोत (Our History & Inspiration)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/news')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>समाचार एवं अपडेट्स (News & Updates)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/membership-registration')}
                  className="text-amber-300 hover:text-amber-200 font-semibold transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-400 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>निःशुल्क सदस्यता पंजीकरण (Free Membership)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/member-login')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>सदस्य लॉगिन (Member Login)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/verify')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>डिजिटल आईडी सत्यापन (Verify ID Card)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center">
              <span className="text-amber-400 mr-1.5">▪</span> नियम व सुरक्षा / Legal & Terms
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>गोपनीयता नीति (Privacy Policy)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>नियम एवं शर्तें (Terms & Conditions)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-amber-400 transition flex items-center group"
                >
                  <ChevronRight className="w-3 h-3 text-amber-500 mr-1 group-hover:translate-x-0.5 transition" />
                  <span>सहायता एवं संपर्क केंद्र (Helpdesk)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin-login')}
                  className="text-slate-500 hover:text-slate-300 transition flex items-center group mt-4 pt-2 border-t border-slate-900"
                >
                  <Lock className="w-3 h-3 text-slate-500 mr-1" />
                  <span>प्रशासक पोर्टल (Admin Portal)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center">
              <span className="text-amber-400 mr-1.5">▪</span> संपर्क कार्यालय / Contact Office
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-white block">Paswan Ekta Manch</span>
                  <span>{settings?.address || 'Village: AT Pakri, Post: Pakribarama, District: Nawada, State: Bihar, Country: India'}</span>
                </div>
              </li>
              {settings?.contact_number ? (
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${settings.contact_number}`} className="hover:text-white transition">
                    {settings.contact_number}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings?.email || 'paswanektamanchpakribarama@gmail.com'}`} className="hover:text-white transition">
                  {settings?.email || 'paswanektamanchpakribarama@gmail.com'}
                </a>
              </li>
            </ul>

            {/* Official WhatsApp Group Join CTA (Shown only when saved by Admin) */}
            {settings?.whatsapp_group_link?.trim() && (
              <div className="pt-2">
                <a
                  href={settings.whatsapp_group_link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Our WhatsApp Group</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom copyright ribbon */}
      <div className="border-t border-slate-900 bg-black/40 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>
            © {currentYear} {settings?.org_name || 'Paswan Ekta Manch'} (पासवान एकता मंच). All rights reserved.
          </p>
          <p className="flex items-center text-[11px] text-slate-400">
            Dedicated to Social Unity & Welfare <Heart className="w-3 h-3 text-red-500 mx-1 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
