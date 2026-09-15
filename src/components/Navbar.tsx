import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  Menu,
  X,
  Lock,
  Phone,
  Search,
  Home,
  Info,
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { OrganizationSettings, Member } from '../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  settings: OrganizationSettings | null;
  member?: Member | null;
  isMemberLoggedIn?: boolean;
  isAdminLoggedIn?: boolean;
  onMemberLogout: () => void;
  onAdminLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  settings,
  member,
  isMemberLoggedIn,
  isAdminLoggedIn,
  onMemberLogout,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveMemberLoggedIn = isMemberLoggedIn ?? !!member;
  const effectiveAdminLoggedIn = isAdminLoggedIn ?? !!localStorage.getItem('pem_admin_token');

  const navItems = [
    { label: 'मुख्य पृष्ठ / Home', path: '/', icon: Home },
    { label: 'परिचय / About', path: '/about', icon: Info },
    { label: 'इतिहास एवं प्रेरणास्रोत / History', path: '/history', icon: BookOpen },
    { label: 'समाचार / News', path: '/news', icon: Newspaper },
    { label: 'सदस्यता पंजीकरण / Register', path: '/membership-registration', icon: UserPlus, highlight: true },
    { label: 'सदस्यता सत्यापन / Verify', path: '/verify', icon: Search },
    { label: 'संपर्क / Contact', path: '/contact', icon: Phone },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top golden-blue announcement ribbon */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium text-amber-200">
              {settings?.tagline || 'एकता • समानता • सामाजिक न्याय • सेवा'}
            </span>
            <span className="hidden md:inline text-blue-200">| राष्ट्रीय गैर-सरकारी सामाजिक संगठन</span>
          </div>
          <div className="flex items-center space-x-4 text-xs shrink-0">
            {settings?.contact_number && (
              <a
                href={`tel:${settings.contact_number}`}
                className="hidden sm:flex items-center space-x-1 text-slate-200 hover:text-white transition"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span>हेल्पलाइन: {settings.contact_number}</span>
              </a>
            )}
            {effectiveAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('/admin-dashboard')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-2 py-0.5 rounded text-[11px] transition"
                >
                  Admin Panel
                </button>
                <button
                  onClick={onAdminLogout || (() => { localStorage.removeItem('pem_admin_token'); window.location.reload(); })}
                  className="text-slate-300 hover:text-white text-[11px] underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/admin-login')}
                className="text-slate-300 hover:text-amber-300 transition flex items-center space-x-1"
                title="प्रशासक लॉगिन"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div
            onClick={() => handleNav('/')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
          >
            <div className="relative flex-shrink-0">
              <img
                src={settings?.logo_url || '/default-assets/logo.svg'}
                alt="Paswan Ekta Manch Logo"
                className="w-13 h-13 rounded-full object-contain shadow-sm p-0.5 bg-gradient-to-tr from-amber-400 to-blue-900 border-2 border-amber-400 group-hover:scale-105 transition duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 font-serif leading-none">
                {settings?.org_name_hindi || 'पासवान एकता मंच'}
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-wider text-amber-700 uppercase leading-tight mt-0.5">
                {settings?.org_name || 'PASWAN EKTA MANCH'}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block">
                Registered Community Organization
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              if (item.highlight) {
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-1.5 shadow-sm ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-amber-200'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>सदस्यता लें (Free)</span>
                  </button>
                );
              }
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition flex items-center space-x-1 ${
                    isActive
                      ? 'text-blue-900 bg-blue-50 border-b-2 border-blue-800'
                      : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label.split('/')[0].trim()}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({item.label.split('/')[1]?.trim()})
                  </span>
                </button>
              );
            })}

            {/* Member Section Button */}
            {effectiveMemberLoggedIn ? (
              <div className="flex items-center space-x-2 ml-3 pl-3 border-l border-slate-200">
                <button
                  onClick={() => handleNav('/member-dashboard')}
                  className="px-3.5 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>My Dashboard</span>
                </button>
                <button
                  onClick={onMemberLogout}
                  className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/member-login')}
                className="ml-3 px-3.5 py-2 rounded-lg border border-blue-900 text-blue-950 hover:bg-blue-950 hover:text-white text-sm font-bold flex items-center space-x-1.5 transition"
              >
                <LogIn className="w-4 h-4 text-blue-800" />
                <span>सदस्य लॉगिन (Login)</span>
              </button>
            )}
          </nav>

          {/* Mobile menu hamburger button */}
          <div className="lg:hidden flex items-center space-x-2">
            {!effectiveMemberLoggedIn && (
              <button
                onClick={() => handleNav('/member-login')}
                className="px-2.5 py-1.5 rounded bg-blue-50 text-blue-950 text-xs font-bold border border-blue-200"
              >
                लॉगिन
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-blue-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-3 ${
                  isActive
                    ? 'bg-blue-900 text-white'
                    : item.highlight
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {effectiveMemberLoggedIn ? (
              <>
                <button
                  onClick={() => handleNav('/member-dashboard')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-blue-900 text-white font-semibold flex items-center space-x-3"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>सदस्य डैशबोर्ड / My Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onMemberLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-sm text-red-600 font-semibold"
                >
                  लॉगआउट / Logout Member
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav('/member-login')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-blue-900 text-blue-950 font-bold flex items-center space-x-3"
              >
                <LogIn className="w-4 h-4" />
                <span>सदस्य लॉगिन / Member Login</span>
              </button>
            )}

            {effectiveAdminLoggedIn ? (
              <button
                onClick={() => handleNav('/admin-dashboard')}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs bg-amber-100 text-amber-900 font-semibold"
              >
                प्रशासक डैशबोर्ड / Admin Dashboard
              </button>
            ) : (
              <button
                onClick={() => handleNav('/admin-login')}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs text-slate-500 flex items-center space-x-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
