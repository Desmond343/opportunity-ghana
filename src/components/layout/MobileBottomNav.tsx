import React from 'react';
import { Home, Briefcase, LayoutGrid, Info } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate
}) => {
  const [pathname] = currentPath.split('?');

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: pathname === '/'
    },
    {
      label: 'Opportunities',
      icon: Briefcase,
      path: '/opportunities',
      isActive:
        pathname === '/opportunities' ||
        pathname.startsWith('/opportunities/') ||
        pathname === '/jobs' ||
        pathname === '/internships' ||
        pathname === '/scholarships'
    },
    {
      label: 'Categories',
      icon: LayoutGrid,
      path: '/categories',
      isActive: pathname === '/categories'
    },
    {
      label: 'About',
      icon: Info,
      path: '/about',
      isActive: pathname === '/about'
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer touch-manipulation select-none ${
                active
                  ? 'text-[#006B3F] dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
              <span className="text-[11px] leading-none truncate max-w-[76px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
