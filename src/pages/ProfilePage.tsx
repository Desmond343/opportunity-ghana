import React from 'react';
import { useAuth } from '../services/authContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  User as UserIcon,
  Shield,
  Smartphone,
  Download,
  CheckCircle,
  Bell,
  LogOut,
  MapPin,
  GraduationCap,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '../types/database';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, logout, switchRole, isFirebaseActive } = useAuth();
  const { isInstalled, isInstallable, isIOS, install } = usePWAInstall();

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'user', label: 'Student / Seeker', desc: 'Browse, save, and apply' },
    { role: 'admin', label: 'Admin (Full CMS)', desc: 'Publish, verify, configure' },
    { role: 'editor', label: 'Editor', desc: 'Draft & verify records' },
    { role: 'organization', label: 'Partner Organization', desc: 'Submit opportunities' }
  ];

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-space">Your Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to track applications, save scholarships, and customize your opportunity alerts.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            Sign In to Opportunity Ghana
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
          >
            Create Free Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-space">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
              {currentUser.location && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentUser.location}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Education & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              University / Institution
            </span>
            <p className="font-medium text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              {currentUser.university || 'Not specified'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Course / Field of Study
            </span>
            <p className="font-medium text-slate-800">{currentUser.course || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* PWA & Device Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Opportunity Ghana App Status
            </h3>
            <p className="text-xs text-slate-500">
              Progressive Web App installation &amp; offline configuration
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 p-1 flex items-center justify-center shadow-2xs">
              <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isInstalled ? 'App is Installed (Standalone Mode)' : 'Web Browser Mode'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isInstalled
                  ? 'Running seamlessly in full standalone native experience.'
                  : 'Install Opportunity Ghana on your device for fast 1-tap home screen access.'}
              </p>
            </div>
          </div>

          {isInstalled ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100/60 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Installed
            </span>
          ) : isInstallable ? (
            <button
              onClick={() => install()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Install Now
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Ready</span>
          )}
        </div>
      </div>

      {/* Role Switcher (for preview & testing) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Role &amp; Permissions Switcher
              </h3>
              <p className="text-xs text-slate-500">
                Toggle roles to test different user journeys and admin permissions
              </p>
            </div>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Open Admin CMS
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentUser.role === r.role
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/20 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{r.label}</span>
                {currentUser.role === r.role && (
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
