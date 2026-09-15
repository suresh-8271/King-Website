import React from 'react';
import { LayoutDashboard, Users, Settings, Image as ImageIcon, BookOpen, Newspaper, LogOut, ArrowLeft } from 'lucide-react';
import { AdminUser, OrganizationSettings } from '../types';

interface AdminNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  settings: OrganizationSettings | null;
}

export const AdminNav: React.FC<AdminNavProps> = ({
  currentPath,
  onNavigate,
  admin,
  onLogout,
  settings,
}) => {
  const tabs = [
    { label: 'डैशबोर्ड (Overview)', path: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'पोस्ट प्रबंधन (Posts)', path: '/admin/posts', icon: Newspaper },
    { label: 'सदस्य प्रबंधन (Members)', path: '/admin/members', icon: Users },
    { label: 'संस्था सेटिंग्स (Settings)', path: '/admin/settings', icon: Settings },
    { label: 'स्लाइडर प्रबंधन (Sliders)', path: '/admin/sliders', icon: ImageIcon },
    { label: 'इतिहास प्रबंधन (History)', path: '/admin/history', icon: BookOpen },
  ];

  return (
    <div className="bg-blue-950 text-white border-b-2 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper admin header */}
        <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-900/60">
          <div className="flex items-center space-x-3">
            <img
              src={settings?.logo_url || '/default-assets/logo.svg'}
              alt="Logo"
              className="w-10 h-10 rounded-full border-2 border-amber-400 bg-white p-0.5 object-contain"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black font-serif text-white">
                  {settings?.org_name_hindi || 'पासवान एकता मंच'}
                </span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-blue-200">
                लॉगिन: <strong className="text-amber-300">{admin?.name || admin?.username || 'Administrator'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>वेबसाइट देखें (View Site)</span>
            </button>
            <button
              onClick={() => {
                onLogout();
                onNavigate('/admin-login');
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>

        {/* Tab links */}
        <nav className="flex space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => onNavigate(tab.path)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-blue-100 hover:bg-blue-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
