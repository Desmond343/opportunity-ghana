import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '../../services/themeContext';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Segmented Pill Control (e.g. For Settings or Profile pages)
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-[#006B3F] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          role="radio"
          aria-checked={theme === 'light'}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-900 text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          role="radio"
          aria-checked={theme === 'dark'}
        >
          <Moon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-700 text-[#006B3F] dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          role="radio"
          aria-checked={theme === 'system'}
        >
          <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Interactive Dropdown Variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Current theme: ${theme}. Click to change theme`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#006B3F] transition-all cursor-pointer shadow-2xs"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="capitalize">{theme}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {menuOpen && (
          <div
            role="listbox"
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
          >
            {[
              { id: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
              { id: 'dark', label: 'Dark', icon: Moon, color: 'text-emerald-400' },
              { id: 'system', label: 'System', icon: Laptop, color: 'text-slate-400' }
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={theme === id}
                onClick={() => {
                  setTheme(id as Theme);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                  theme === id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006B3F] dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{label}</span>
                </div>
                {theme === id && <Check className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default Quick Icon Toggle with Double-click or Right-click / accessible click to flip Light <-> Dark,
  // and long-press / dropdown menu for System
  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }}
        aria-label={
          resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        }
        title={
          resolvedTheme === 'dark'
            ? 'Switch to light mode (Right-click for options)'
            : 'Switch to dark mode (Right-click for options)'
        }
        className="p-2.5 rounded-xl transition-all duration-200 border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006B3F]/30"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-emerald-400 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0" />
        )}
      </button>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};
