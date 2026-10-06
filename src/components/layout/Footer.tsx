import React from 'react';
import { ShieldCheck, Mail, ArrowRight, Heart } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';
import { useAuth } from '../../services/authContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isEditorOrAdmin } = useAuth();

  return (
    <footer className="bg-[#111111] text-neutral-300 border-t border-neutral-800 pt-14 pb-12">
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
              <span className="text-xl font-extrabold text-white tracking-tight font-space flex items-center gap-1.5">
                Opportunity <span className="text-emerald-400">Ghana</span>
                <span className="w-2 h-2 rounded-full bg-[#FCD116]" title="Ghana Gold Accent" />
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Opportunity Ghana connects Ghanaian youth, students, and professionals with verified jobs, scholarships, grants, and practical upskilling pathways.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification Policy: Only verified source URLs published</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-[#006B3F]" />
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/opportunities')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  All Opportunities
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/institutions')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  Institutions & Admissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/resources')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  Courses & Bootcamps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  Career Tracks & Skills
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/tools')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  CV & Career Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/alerts')}
                  className="hover:text-[#006B3F] transition-colors cursor-pointer"
                >
                  Deadline Alerts
                </button>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-[#FCD116]" />
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {OPPORTUNITY_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/opportunities?category=${cat.id}`)}
                    className="hover:text-[#006B3F] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Trust / Admin Section */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-[#006B3F]" />
              {isEditorOrAdmin ? 'Administration' : 'Account & Alerts'}
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              {isEditorOrAdmin ? (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate('/admin')}
                      className="text-[#FCD116] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Admin Dashboard
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('/admin/opportunities')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      Manage Listings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('/admin/resources')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      Manage Resources
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('/admin/settings')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      System Diagnostics
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate('/saved')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      Saved Opportunities
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('/alerts')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      Opportunity Notifications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('/login')}
                      className="hover:text-[#006B3F] transition-colors cursor-pointer"
                    >
                      Sign In / Register
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Opportunity Ghana. Connecting ambition with real opportunities.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CE1126]" title="Ghana Red" />
            <span className="w-2 h-2 rounded-full bg-[#FCD116]" title="Ghana Gold" />
            <span className="w-2 h-2 rounded-full bg-[#006B3F]" title="Ghana Green" />
            <span className="text-neutral-400 ml-1">Verified National Opportunity Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
