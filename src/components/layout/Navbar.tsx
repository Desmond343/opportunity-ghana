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
  const { currentUser, logout, switchRole, isFirebaseActive } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

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
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'user', label: 'Student / Seeker', desc: 'Browse, save, and apply' },
    { role: 'admin', label: 'Admin (Full CMS)', desc: 'Publish, verify, configure' },
    { role: 'editor', label: 'Editor', desc: 'Draft & verify records' },
    { role: 'organization', label: 'Partner Organization', desc: 'Submit opportunities' }
  ];

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
                <span className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1 font-space">
                  Opportunity <span className="text-emerald-700 font-extrabold">Ghana</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
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
                        ? 'text-emerald-800 bg-emerald-50/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-emerald-100/70 text-emerald-900 hover:bg-emerald-200/80'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                CMS Admin
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => handleNavClick('/opportunities')}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Find Opportunities
            </button>

            {/* User Profile / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center uppercase">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div className="hidden lg:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {currentUser?.name || 'Sign In'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    {currentUser?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown */}
              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Current Profile
                    </p>
                    <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      Role: {currentUser?.role}
                    </span>
                  </div>

                  <div className="py-2">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Switch Role (Developer Mode)
                    </p>
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => switchRole(r.role)}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentUser?.role === r.role ? 'text-emerald-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div>{r.label}</div>
                          <div className="text-[10px] text-slate-400">{r.desc}</div>
                        </div>
                        {currentUser?.role === r.role && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 px-2 space-y-1">
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Admin CMS Console
                    </button>
                    <button
                      onClick={() => handleNavClick('/alerts')}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4 text-slate-500" />
                      Alert Preferences
                    </button>
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            <button
              onClick={() => handleNavClick('/admin')}
              className="text-left px-3 py-2 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-100/50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin CMS Console
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500 uppercase font-semibold">
                Role: {currentUser?.role}
              </p>
            </div>
            <button
              onClick={() => switchRole(currentUser?.role === 'admin' ? 'user' : 'admin')}
              className="text-xs font-semibold text-emerald-700 underline"
            >
              Switch to {currentUser?.role === 'admin' ? 'User' : 'Admin'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
