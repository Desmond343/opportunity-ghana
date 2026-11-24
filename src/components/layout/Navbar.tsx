import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { SavedService } from '../../services/savedService';
import {
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bookmark,
  Bell
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
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

  const [pathname] = currentPath.split('?');

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Categories', path: '/categories' },
    { label: 'About', path: '/about' }
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/opportunities') {
      return (
        pathname === '/opportunities' ||
        pathname.startsWith('/opportunities/') ||
        pathname === '/jobs' ||
        pathname === '/internships' ||
        pathname === '/scholarships'
      );
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-15 gap-3">
          {/* LEFT: Compact Brand Mark + Wordmark */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 text-left cursor-pointer focus:outline-none shrink-0"
          >
            <img
              src="/icon-192.png"
              alt="Opportunity Ghana"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white"
            />
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
              Opportunity <span className="text-[#006B3F] dark:text-emerald-400">Ghana</span>
            </span>
          </button>

          {/* CENTER: 4 Primary Navigation Links (Desktop) */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'text-[#006B3F] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Theme, Saved, Admin (if authorized), Account */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleNavClick('/saved')}
              aria-label="Saved opportunities"
              title="Saved Opportunities"
              className={`relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                pathname === '/saved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-[#006B3F] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>

            <ThemeToggle />

            {isEditorOrAdmin && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#006B3F] text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#141B29] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/saved')}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saved Opportunities</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/alerts')}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline Alerts</span>
                      </button>
                      {isEditorOrAdmin && (
                        <button
                          onClick={() => handleNavClick('/admin')}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-[#006B3F] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin CMS</span>
                        </button>
                      )}
                    </div>
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* MOBILE RIGHT: Saved, Theme, Drawer Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => handleNavClick('/saved')}
              aria-label="Saved opportunities"
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 bg-[#006B3F] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Compact Mobile Drawer (Secondary links & Account) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141F] px-4 py-3 space-y-3 shadow-lg">
          <nav className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Home', path: '/' },
              { label: 'Opportunities', path: '/opportunities' },
              { label: 'Categories', path: '/categories' },
              { label: 'About', path: '/about' },
              { label: 'Institutions', path: '/institutions' },
              { label: 'Free Courses', path: '/courses' },
              { label: 'Saved', path: '/saved' },
              { label: 'Deadline Alerts', path: '/alerts' }
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium min-h-[44px] ${
                  isLinkActive(link.path)
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {isEditorOrAdmin && (
            <button
              onClick={() => handleNavClick('/admin')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-[#006B3F] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 flex items-center gap-2 min-h-[44px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate py-2"
                >
                  {currentUser.name}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 py-2 px-3"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="w-full py-2.5 rounded-lg bg-[#006B3F] text-white font-semibold text-xs text-center min-h-[44px]"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
