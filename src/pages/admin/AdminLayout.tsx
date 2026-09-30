import React from 'react';
import { useAuth } from '../../services/authContext';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Building,
  Sparkles,
  Inbox,
  AlertTriangle,
  Users,
  Settings,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { currentUser, isEditorOrAdmin, switchRole } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'AI Content Assistant', path: '/admin/ai-assistant', icon: Sparkles },
    { label: 'Opportunities', path: '/admin/opportunities', icon: Compass },
    { label: 'Resources', path: '/admin/resources', icon: BookOpen },
    { label: 'Organizations', path: '/admin/organizations', icon: Building },
    { label: 'Skills', path: '/admin/skills', icon: Sparkles },
    { label: 'Submissions', path: '/admin/submissions', icon: Inbox },
    { label: 'Reports', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  // Route protection
  if (!isEditorOrAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-space">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Opportunity Ghana CMS is restricted to verified administrators and editors. Your current profile is set to{' '}
          <strong className="text-slate-800 uppercase font-bold">{currentUser?.role || 'Guest'}</strong>.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => switchRole('admin')}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Switch to Admin Profile (Dev Mode)
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Return to Public Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Compass className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white font-space">
                Opportunity Ghana <span className="text-emerald-400">CMS</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 uppercase">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Content Operations & Verification Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 shrink-0">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              CMS Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? currentPath === '/admin'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Pipeline Note */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verification Principle
            </p>
            <p className="text-[10px] text-emerald-800 leading-relaxed">
              Always verify application links, host institutions, and deadlines before toggling status to <strong>Published</strong>.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
