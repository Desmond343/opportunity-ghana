import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { AdminService } from '../../services/adminService';
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
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  Lock,
  GraduationCap
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { currentUser, firebaseUser, claims, isAdmin, isEditorOrAdmin, refreshClaims } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    AdminService.getPipelineMetrics()
      .then((m) => {
        if (isMounted) setPendingCount(m.pendingSubmissionsCount);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [currentPath]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const granted = await refreshClaims();
      if (granted) {
        setRefreshMessage('Permissions updated: Administrator claims confirmed!');
      } else {
        setRefreshMessage('Claims refreshed: No administrator claim found on this account yet.');
      }
    } catch {
      setRefreshMessage('Could not reach authentication server to refresh claims.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 6000);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Scholarship Research', path: '/admin/scholarship-research', icon: GraduationCap },
    { label: 'AI Content Assistant', path: '/admin/ai-assistant', icon: Sparkles },
    { label: 'Opportunities', path: '/admin/opportunities', icon: Compass },
    { label: 'Resources', path: '/admin/resources', icon: BookOpen },
    { label: 'Organizations', path: '/admin/organizations', icon: Building },
    { label: 'Skills', path: '/admin/skills', icon: Sparkles },
    { label: 'Submissions', path: '/admin/submissions', icon: Inbox },
    { label: 'Reports', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Settings & Diagnostics', path: '/admin/settings', icon: Settings }
  ];

  // Route protection: Must be authenticated and possess admin or editor claim
  if (!currentUser || !isEditorOrAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F17]">
        <div className="max-w-md w-full bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-space tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your account does not have permission to access the Opportunity Ghana Administration Dashboard.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If you believe you should have administrator access, contact the site administrator.
            </p>
          </div>

          {/* Diagnostic info for signed-in users trying to access */}
          {currentUser && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-[11px] space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1 mb-1 font-bold text-slate-700 dark:text-slate-200">
                <span>Account Check</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Unauthorized</span>
              </div>
              <div className="truncate text-slate-700 dark:text-slate-200">
                <span className="text-slate-400">Email:</span> {currentUser.email || 'N/A'}
              </div>
              <div className="text-slate-700 dark:text-slate-200">
                <span className="text-slate-400">Admin Claim:</span> <span className="text-rose-600 dark:text-rose-400 font-semibold">{claims?.admin ? 'true' : 'false'}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-200">
                <span className="text-slate-400">CMS Access:</span> <span className="text-rose-600 dark:text-rose-400 font-semibold">Denied</span>
              </div>
            </div>
          )}

          {refreshMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{refreshMessage}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            {currentUser ? (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing Token...' : 'Refresh Permissions'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Opportunity Ghana</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe UID display (mask middle characters: e.g. "Abc1...xyz9")
  const rawUid = firebaseUser?.uid || currentUser.id || '';
  const maskedUid = rawUid.length > 8 ? `${rawUid.slice(0, 4)}••••${rawUid.slice(-4)}` : rawUid;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F17] flex flex-col transition-colors">
      {/* Top Admin Header */}
      <header className="bg-slate-900 dark:bg-black text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
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
                {isAdmin ? 'ADMIN' : 'EDITOR'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Administrative Operations &amp; CMS Console</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Refresh Permissions Trigger */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Firebase Token Claims"
            className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh Token</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-[#141B29] border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 shrink-0">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
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
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.path === '/admin/submissions' && pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow-2xs">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Admin Authorization Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <span>Active Admin Session</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold truncate">
              {currentUser.email}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Firebase UID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{maskedUid}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Admin Claim:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">true</span>
            </div>
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
