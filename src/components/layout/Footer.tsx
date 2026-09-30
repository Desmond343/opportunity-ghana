import React from 'react';
import { Compass, ShieldCheck, Mail, Heart, ExternalLink, ArrowRight } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white p-0.5 flex items-center justify-center text-white shadow-md">
                <img
                  src="/icon-192.png"
                  alt="Opportunity Ghana"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight font-space">
                Opportunity <span className="text-emerald-400">Ghana</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Opportunity Ghana is an installable, database-driven opportunity and career platform. We connect Ghanaian youth, students, and professionals with verified jobs, scholarships, grants, and upskilling pathways.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification Policy: Only verified source URLs published</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/opportunities')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  All Opportunities
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/resources')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Courses & Bootcamps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Careers & Skills
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/tools')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Career & Application Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/alerts')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Opportunity Alerts
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {OPPORTUNITY_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/opportunities?category=${cat.id}`)}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin & Content Pipeline */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              CMS & Operations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  Admin CMS Console
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin/submissions')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Partner Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin/organizations')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Organization Registry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sign In / Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Opportunity Ghana. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Content Sources → Admin/CMS → Verification → Database → Website → Alerts</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
