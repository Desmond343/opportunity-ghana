import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import { UserRole } from '../../types/database';
import {
  Search,
  Bell,
  Briefcase,
  BookOpen,
  Wrench,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bookmark
} from 'lucide-react';
import { InstallAppPrompt } from '../pwa/InstallAppPrompt';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { currentUser, logout, isFirebaseActive, isEditorOrAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Resources', path: '/resources' },
    { label: 'Career', path: '/careers' },
    { label: 'Tools', path: '/tools' },
    { label: 'Saved', path: '/saved' },
    { label: 'Alerts', path: '/alerts' }
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                <img
                  src="/icon-192.png"
                  alt="Opportunity Ghana Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-lg font-extrabold text-[#111111] tracking-tight flex items-center gap-1 font-space">
                  Opportunity <span className="text-[#006B3F] font-extrabold">Ghana</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FCD116] inline-block mb-1" title="Opportunity Ghana" />
                </span>
                <span className="hidden sm:block text-[10px] text-[#5F6368] font-medium -mt-1 tracking-wide">
                  Find opportunities • Advance your career
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#006B3F] bg-[#E6F0EB] font-bold shadow-2xs'
                        : 'text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F9F8]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* In-App PWA Install Trigger */}
            <InstallAppPrompt variant="navbar" />

            {/* Quick Search trigger */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 text-[#5F6368] hover:text-[#111111] hover:bg-[#F7F9F8] rounded-xl transition-colors cursor-pointer"
                title="Search (Quick Search)"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Admin CMS Direct Shortcut */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  currentPath.startsWith('/admin')
                    ? 'bg-[#006B3F] text-white shadow-xs'
                    : 'bg-[#E6F0EB] text-[#006B3F] hover:bg-[#d6e7df]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F]" />
                CMS Admin
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => handleNavClick('/opportunities')}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005632] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Find Opportunities
            </button>

            {/* User Profile / Auth Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center uppercase">
                    {currentUser.name?.[0] || 'U'}
                  </div>
                  <div className="hidden lg:block leading-tight">
                    <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Signed In
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 px-2 space-y-0.5">
                      <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        My Profile & App Settings
                      </button>
                      <button
                        onClick={() => handleNavClick('/saved')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-slate-500" />
                        Saved Opportunities
                      </button>
                      <button
                        onClick={() => handleNavClick('/alerts')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-slate-500" />
                        Alert Preferences
                      </button>
                      {isEditorOrAdmin && (
                        <button
                          onClick={() => handleNavClick('/admin')}
                          className="w-full text-left px-3 py-1.5 text-xs text-emerald-800 font-bold bg-emerald-50/60 hover:bg-emerald-100/60 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          Admin CMS Console
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 px-2">
                      <button
                        onClick={() => logout()}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('/opportunities')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 rounded-lg shadow-2xs"
            >
              Search
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                  currentPath === link.path
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isEditorOrAdmin && (
              <button
                onClick={() => handleNavClick('/admin')}
                className="text-left px-3 py-2 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-100/50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin CMS Console
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {currentUser ? (
              <>
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">
                    {currentUser.role}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavClick('/profile')}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => logout()}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs text-center shadow-2xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
