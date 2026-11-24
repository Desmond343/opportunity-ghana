import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../services/authContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isEditorOrAdmin } = useAuth();

  return (
    <footer className="hidden md:block bg-slate-900 text-slate-300 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 text-left cursor-pointer"
            >
              <img
                src="/icon-192.png"
                alt="Opportunity Ghana"
                className="w-7 h-7 rounded-lg object-contain bg-white"
              />
              <span className="text-base font-bold text-white tracking-tight">
                Opportunity <span className="text-emerald-400">Ghana</span>
              </span>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verified scholarships, jobs, internships, grants, and learning pathways for Ghanaian students and professionals.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
            <button onClick={() => onNavigate('/')} className="hover:text-emerald-400 cursor-pointer">
              Home
            </button>
            <button onClick={() => onNavigate('/opportunities')} className="hover:text-emerald-400 cursor-pointer">
              Opportunities
            </button>
            <button onClick={() => onNavigate('/categories')} className="hover:text-emerald-400 cursor-pointer">
              Categories
            </button>
            <button onClick={() => onNavigate('/institutions')} className="hover:text-emerald-400 cursor-pointer">
              Institutions
            </button>
            <button onClick={() => onNavigate('/courses')} className="hover:text-emerald-400 cursor-pointer">
              Free Courses
            </button>
            <button onClick={() => onNavigate('/alerts')} className="hover:text-emerald-400 cursor-pointer">
              Alerts
            </button>
            <button onClick={() => onNavigate('/about')} className="hover:text-emerald-400 cursor-pointer">
              About
            </button>
            {isEditorOrAdmin && (
              <button onClick={() => onNavigate('/admin')} className="text-amber-400 hover:underline cursor-pointer">
                Admin CMS
              </button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Opportunity Ghana. Zero application fee policy.</p>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Verified institutional sources only</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
