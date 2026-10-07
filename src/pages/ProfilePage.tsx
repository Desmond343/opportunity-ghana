import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ResourcesService } from '../services/resourcesService';
import { OpportunitiesService } from '../services/opportunitiesService';
import { SavedService } from '../services/savedService';
import { Resource, Opportunity } from '../types/database';
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
  ExternalLink,
  BookOpen,
  Compass,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bookmark,
  ArrowRight
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, logout, isFirebaseActive, isAdmin, isEditorOrAdmin } = useAuth();
  const { isInstalled, isInstallable, isIOS, install } = usePWAInstall();

  const [mySubmissions, setMySubmissions] = useState<Resource[]>([]);
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => SavedService.getSavedIds().length);

  useEffect(() => {
    setSavedCount(SavedService.getSavedIds().length);
    const handleSavedUpdate = () => {
      setSavedCount(SavedService.getSavedIds().length);
    };
    window.addEventListener('saved-opportunities-changed', handleSavedUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleSavedUpdate);
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      setLoadingSubmissions(true);
      Promise.all([
        ResourcesService.getUserSubmissions(currentUser.id, currentUser.email),
        OpportunitiesService.getUserSubmissions(currentUser.id, currentUser.email)
      ])
        .then(([resItems, oppItems]) => {
          setMySubmissions(resItems);
          setMyOpportunities(oppItems);
        })
        .catch((err) => console.warn('Failed to load user submissions', err))
        .finally(() => setLoadingSubmissions(false));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-space">Your Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to track applications, save scholarships, submit resources, and customize your opportunity alerts.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Sign In to Opportunity Ghana
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
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
      <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-bold font-space shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-space">{currentUser.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              Ghana Region
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{currentUser.region || 'Greater Accra'}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              Education Status
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{currentUser.educationLevel || 'Undergraduate'}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">
              Course / Field of Study
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{currentUser.course || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Saved Opportunities Quick Access */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6 fill-emerald-700 dark:fill-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
              Saved Opportunities &amp; Bookmarks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              You have {savedCount} saved opportunit{savedCount === 1 ? 'y' : 'ies'} bookmarked for deadline tracking.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/saved')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View Saved Items</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* User Contributed Opportunities Section */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] dark:bg-emerald-950/50 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                My Opportunity Submissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status of scholarships, jobs, and programs you submitted for review
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/opportunities/submit')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit an Opportunity</span>
          </button>
        </div>

        {loadingSubmissions ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">Loading your opportunity submissions...</div>
        ) : myOpportunities.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myOpportunities.map((opp) => {
              const isApproved = opp.submissionStatus === 'approved' || opp.status === 'published';
              const isRejected = opp.submissionStatus === 'rejected' || opp.status === 'rejected';
              const isChanges = opp.submissionStatus === 'changes_requested';

              return (
                <div key={opp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{opp.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {opp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {opp.organizationName} • {opp.location} • Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-GB') : 'Rolling'}
                    </p>
                    {opp.rejectionReason && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl mt-1">
                        <strong>Editorial Note:</strong> {opp.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Approved & Live
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Declined
                      </span>
                    ) : isChanges ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Changes Requested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        Pending Review
                      </span>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => onNavigate(`/opportunities/${opp.slug}`)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="View Public Opportunity"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <Compass className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No opportunities submitted yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Know of a verified scholarship, graduate role, or training program? Submit it to help fellow Ghanaians advance.
            </p>
            <button
              onClick={() => onNavigate('/opportunities/submit')}
              className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Opportunity</span>
            </button>
          </div>
        )}
      </div>

      {/* User Contributed Learning Resources Section */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                My Resource Submissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status of learning courses and bootcamps you submitted for review
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/resources/submit')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit a Resource</span>
          </button>
        </div>

        {loadingSubmissions ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">Loading your submissions...</div>
        ) : mySubmissions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mySubmissions.map((sub) => {
              const status = sub.submissionStatus || (sub.status === 'published' ? 'approved' : 'pending');
              return (
                <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {sub.resourceType} • {sub.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{sub.description}</p>
                    {sub.rejectionReason && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg mt-1 border border-rose-200 dark:border-rose-900/50">
                        <strong>Editorial Note:</strong> {sub.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Approved & Live
                      </span>
                    ) : status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Declined
                      </span>
                    ) : status === 'changes_requested' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Changes Requested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        Pending Review
                      </span>
                    )}

                    {status === 'approved' && (
                      <button
                        onClick={() => onNavigate(`/resources/${sub.slug}`)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                        title="View Public Resource"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No resources submitted yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Know of an impactful scholarship, coding bootcamp, or certification course in Ghana? Share it with our community.
            </p>
            <button
              onClick={() => onNavigate('/resources/submit')}
              className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Resource</span>
            </button>
          </div>
        )}
      </div>

      {/* PWA & Device Status Card */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Opportunity Ghana App Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progressive Web App installation &amp; offline configuration
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-1 flex items-center justify-center shadow-2xs">
              <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isInstalled ? 'App is Installed (Standalone Mode)' : 'Web Browser Mode'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isInstalled
                  ? 'Running seamlessly in full standalone native experience.'
                  : 'Install Opportunity Ghana on your device for fast 1-tap home screen access.'}
              </p>
            </div>
          </div>

          {isInstalled ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
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

      {/* Authorized Staff Access (only for authenticated admin / editor accounts) */}
      {isEditorOrAdmin && (
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Opportunity Ghana Staff & Editorial Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You are signed in with an authorized <span className="font-semibold text-emerald-700 dark:text-emerald-400 capitalize">{currentUser.role}</span> account.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              Open Admin CMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
