import React from 'react';
import { Home, Search, Bookmark, Bell, User } from 'lucide-react';
import { useAuth } from '../../services/authContext';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch
}) => {
  const { currentUser } = useAuth();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: currentPath === '/'
    },
    {
      label: 'Search',
      icon: Search,
      action: onOpenSearch,
      isActive: currentPath === '/opportunities' && window.location.search.includes('search')
    },
    {
      label: 'Saved',
      icon: Bookmark,
      path: '/saved',
      isActive: currentPath === '/saved'
    },
    {
      label: 'Alerts',
      icon: Bell,
      path: '/alerts',
      isActive: currentPath === '/alerts'
    },
    {
      label: currentUser ? 'Profile' : 'Sign In',
      icon: User,
      path: currentUser ? '/profile' : '/login',
      isActive: currentPath === '/profile' || currentPath === '/login' || currentPath === '/signup'
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)] shadow-lg transition-colors duration-150"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  onNavigate(item.path);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer touch-manipulation select-none py-1 ${
                active
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
