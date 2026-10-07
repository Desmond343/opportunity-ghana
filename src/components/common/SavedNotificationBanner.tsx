import React, { useState, useEffect } from 'react';
import { SavedFeedbackDetail } from '../../services/savedService';
import { Bookmark, CheckCircle2, LogIn, ArrowRight, X, AlertCircle } from 'lucide-react';

interface SavedNotificationBannerProps {
  onNavigate: (path: string) => void;
}

export const SavedNotificationBanner: React.FC<SavedNotificationBannerProps> = ({ onNavigate }) => {
  const [feedback, setFeedback] = useState<SavedFeedbackDetail | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleFeedback = (event: Event) => {
      const customEvent = event as CustomEvent<SavedFeedbackDetail>;
      if (!customEvent.detail) return;
      setFeedback(customEvent.detail);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setFeedback(null);
      }, customEvent.detail.isGuest ? 6500 : 4200);
    };

    window.addEventListener('saved-opportunity-feedback', handleFeedback);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('saved-opportunity-feedback', handleFeedback);
    };
  }, []);

  if (!feedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              feedback.error
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : feedback.isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {feedback.error ? (
              <AlertCircle className="w-5 h-5" />
            ) : feedback.isSaved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
              {feedback.error
                ? 'Could not sync bookmark'
                : feedback.isSaved
                ? 'Saved to your bookmarks'
                : 'Removed from Saved'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
              {feedback.title}
            </p>

            {feedback.isSaved && feedback.isGuest && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                Sign in to permanently save this opportunity to your account across devices.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {feedback.isSaved && (
                <button
                  onClick={() => {
                    setFeedback(null);
                    onNavigate('/saved');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006B3F] hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <span>View Saved</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {feedback.isSaved && feedback.isGuest && (
                <button
                  onClick={() => {
                    setFeedback(null);
                    onNavigate('/login');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In to Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setFeedback(null)}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
