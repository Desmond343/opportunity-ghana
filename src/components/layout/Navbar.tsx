import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { SavedService } from '../../services/savedService';
import {
  Search,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bookmark,
  Bell,
  Sparkles
} from 'lucide-react';
import { InstallAppPrompt } from '../pwa/InstallAppPrompt';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { currentUser, logout, isEditorOrAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(() => SavedService.getSavedIds().length);

  useEffect(() => {
    setSavedCount(SavedService.getSavedIds().length);
    const handleUpdate = () => {
      setSavedCount(SavedService.getSavedIds().length);
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Internships', path: '/internships' },
    { label: 'Scholarships', path: '/scholarships' },
    { label: 'All Opportunities', path: '/opportunities' },
    { label: 'Resources', path: '/resources' },
    { label: 'Saved', path: '/saved' }
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* LEFT: Official Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-10">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-0.5 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                <img
                  src="/icon-192.png"
                  alt="Opportunity Ghana Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-lg font-black text-[#111111] tracking-tight flex items-center gap-1 font-space">
                  Opportunity <span className="text-[#006B3F]">Ghana</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FCD116] inline-block mb-1" title="Ghana Gold Accent" />
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
                  Find Opportunities • Build Your Future
                </span>
              </div>
            </button>

            {/* CENTER/LEFT: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(link.path.split('?')[0]);
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.path)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'text-[#006B3F] bg-[#E8F5EF] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-[#111111] hover:bg-slate-100/70'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Search, Saved, Admin (if auth), Login/Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            <InstallAppPrompt variant="navbar" />

            {/* Quick Search trigger */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="Search opportunities"
                className="p-2.5 text-slate-500 hover:text-[#111111] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Search Opportunities"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Saved Opportunities Direct Shortcut */}
            <button
              onClick={() => handleNavClick('/saved')}
              aria-label="Saved opportunities"
              title="Saved Opportunities"
              className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
                currentPath === '/saved'
                  ? 'bg-[#E8F5EF] text-[#006B3F]'
                  : 'text-slate-500 hover:text-[#111111] hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#006B3F] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>

            {/* Admin CMS Direct Shortcut - Displayed only for verified custom claim admins/editors */}
            {isEditorOrAdmin && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentPath.startsWith('/admin')
                    ? 'bg-[#006B3F] text-white shadow-xs'
                    : 'bg-[#E8F5EF] text-[#006B3F] hover:bg-[#d6e7df]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F]" />
                Admin Dashboard
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => handleNavClick('/opportunities')}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005530] rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Find Opportunities
            </button>

            {/* User Profile / Auth Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E8F5EF] text-[#006B3F] flex items-center justify-center text-xs font-bold">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        My Profile & Applications
                      </button>
                      <button
                        onClick={() => handleNavClick('/opportunities/submit')}
                        className="w-full px-4 py-2 text-xs text-[#006B3F] hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#006B3F]" />
                        Submit an Opportunity
                      </button>
                      <button
                        onClick={() => handleNavClick('/resources/submit')}
                        className="w-full px-4 py-2 text-xs text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Submit a Resource
                      </button>
                      <button
                        onClick={() => handleNavClick('/saved')}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        Saved Opportunities
                      </button>
                      <button
                        onClick={() => handleNavClick('/alerts')}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        Opportunity Alerts
                      </button>

                      {isEditorOrAdmin && (
                        <button
                          onClick={() => handleNavClick('/admin')}
                          className="w-full px-4 py-2 text-xs font-bold text-[#006B3F] hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F]" />
                          Admin CMS Console
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Search Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="Search"
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.path)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentPath === link.path.split('?')[0]
                    ? 'bg-[#E8F5EF] text-[#006B3F] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {currentUser && (
              <>
                <button
                  onClick={() => handleNavClick('/opportunities/submit')}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                    currentPath === '/opportunities/submit'
                      ? 'bg-[#E8F5EF] text-[#006B3F]'
                      : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#006B3F]" />
                  Submit an Opportunity
                </button>
                <button
                  onClick={() => handleNavClick('/resources/submit')}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                    currentPath === '/resources/submit'
                      ? 'bg-[#E8F5EF] text-[#006B3F] font-bold'
                      : 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#006B3F]" />
                  Submit a Resource
                </button>
              </>
            )}

            {isEditorOrAdmin && (
              <button
                onClick={() => handleNavClick('/admin')}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#006B3F] bg-[#E8F5EF] flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#006B3F]" />
                Admin CMS Console
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {currentUser ? (
              <>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">
                    {currentUser.role}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavClick('/profile')}
                    className="text-xs font-semibold text-[#006B3F] hover:underline"
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
                  className="flex-1 py-2.5 rounded-xl bg-[#006B3F] text-white font-bold text-xs text-center shadow-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs text-center border border-slate-200"
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
