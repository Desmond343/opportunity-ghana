import React, { useState } from 'react';
import { usePWAInstall, BrowserPlatformInfo } from '../../hooks/usePWAInstall';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  MoreVertical
} from 'lucide-react';

interface InstallAppPromptProps {
  variant?: 'banner' | 'card' | 'navbar' | 'mobile-menu';
  onActionComplete?: () => void;
}

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({
  variant = 'banner',
  onActionComplete
}) => {
  const {
    isInstallable,
    isInstalled,
    justInstalled,
    isIOS,
    platformInfo,
    isDismissed,
    install,
    dismiss,
    clearJustInstalled
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Show celebratory confirmation toast when the app was just installed (only once via the global 'banner' instance)
  if (justInstalled && variant === 'banner') {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="rounded-2xl bg-emerald-900 dark:bg-emerald-950 text-white p-4 shadow-2xl border border-emerald-600/60 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white">
              Opportunity Ghana Installed!
            </h4>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
              You can now launch Opportunity Ghana directly from your home screen or applications menu.
            </p>
          </div>
          <button
            onClick={clearJustInstalled}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer"
            aria-label="Close installation confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // If already installed as a standalone PWA, hide all install buttons and prompts
  if (isInstalled) {
    return null;
  }

  // For the ambient bottom banner: hide if dismissed by the user, or if neither native prompt nor iOS is active
  if (variant === 'banner') {
    if (isDismissed) {
      return null;
    }
    if (!isInstallable && !isIOS) {
      return null;
    }
  }

  const handleInstallClick = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    setFeedbackNotice(null);

    try {
      // 1. If native beforeinstallprompt is available, trigger it immediately
      if (isInstallable) {
        const outcome = await install();
        if (outcome === 'accepted') {
          setFeedbackNotice({
            type: 'success',
            message: 'Opportunity Ghana installed! Check your home screen or apps launcher.'
          });
          onActionComplete?.();
          return;
        }
        if (outcome === 'dismissed') {
          setFeedbackNotice({
            type: 'info',
            message: 'Installation cancelled. You can install the app anytime from the navigation bar.'
          });
          setTimeout(() => setFeedbackNotice(null), 4000);
          return;
        }
      }

      // 2. If iOS / iPadOS or if native prompt isn't available in this browser/context, open guided installation modal
      const retryOutcome = await install();
      if (retryOutcome === 'accepted') {
        onActionComplete?.();
        return;
      }
      if (retryOutcome === 'dismissed') {
        return;
      }

      setShowGuideModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  // 1. Compact Navbar Button Variant (Desktop & Mobile Header)
  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-900 dark:hover:text-emerald-200 disabled:opacity-60 transition-all shadow-xs cursor-pointer"
          title="Install Opportunity Ghana App"
          aria-label="Install Opportunity Ghana App"
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          )}
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>

        {feedbackNotice && (
          <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 text-xs font-medium shadow-xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3">
            <span>{feedbackNotice.message}</span>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {showGuideModal && (
          <InstallGuideModal
            isIOS={isIOS}
            platformInfo={platformInfo}
            onClose={() => {
              setShowGuideModal(false);
              onActionComplete?.();
            }}
          />
        )}
      </>
    );
  }

  // 2. Mobile Menu Drawer Full-Width Button Variant
  if (variant === 'mobile-menu') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#006B3F] dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between transition-colors cursor-pointer disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            {isInstalling ? (
              <Loader2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            )}
            <span>{isInstalling ? 'Installing Opportunity Ghana...' : 'Install Opportunity Ghana App'}</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#006B3F] text-white">
            PWA
          </span>
        </button>

        {showGuideModal && (
          <InstallGuideModal
            isIOS={isIOS}
            platformInfo={platformInfo}
            onClose={() => {
              setShowGuideModal(false);
              onActionComplete?.();
            }}
          />
        )}
      </>
    );
  }

  // 3. Standalone Card Variant (for Home or Profile pages)
  if (variant === 'card') {
    return (
      <>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-6 shadow-xl border border-emerald-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-md shrink-0 flex items-center justify-center border border-white/20 dark:border-slate-700">
                <img
                  src="/icon-192.png"
                  alt="Opportunity Ghana Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Official Progressive Web App
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-space mt-0.5">
                  Install Opportunity Ghana
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1 max-w-md">
                  Get instant 1-tap access to jobs, scholarships, courses, and internships directly on your home screen.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-xs font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                {isInstalling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            </div>
          </div>
        </div>

        {showGuideModal && (
          <InstallGuideModal
            isIOS={isIOS}
            platformInfo={platformInfo}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </>
    );
  }

  // 4. Floating Bottom Banner Variant (Default)
  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
        <div className="relative rounded-2xl bg-white dark:bg-[#141B29] p-4 shadow-2xl border border-emerald-100 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10 transition-colors">
          <button
            onClick={dismiss}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src="/icon-192.png"
                alt="Opportunity Ghana Icon"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Install Opportunity Ghana
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Get quick access to jobs, scholarships, courses, internships and more directly from your device.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {isInstalling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isInstalling ? 'Installing...' : 'Install App'}
            </button>
          </div>
        </div>
      </div>

      {showGuideModal && (
        <InstallGuideModal
          isIOS={isIOS}
          platformInfo={platformInfo}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
};

// Device & Browser-Aware Guided Installation Modal
const InstallGuideModal: React.FC<{
  isIOS: boolean;
  platformInfo: BrowserPlatformInfo;
  onClose: () => void;
}> = ({ isIOS, platformInfo, onClose }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141B29] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Opportunity Ghana"
              className="w-10 h-10 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isIOS
                  ? 'Install Opportunity Ghana on iPhone / iPad'
                  : platformInfo.isAndroid
                  ? 'Install Opportunity Ghana on Android'
                  : 'Install Opportunity Ghana App'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isIOS
                  ? 'Add to your Home Screen in 3 simple steps'
                  : `Quick installation for ${platformInfo.browserName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close installation guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Preview / Iframe Notice */}
        {platformInfo.isInIframe && !isIOS && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 space-y-2.5">
            <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 leading-relaxed">
              You are viewing Opportunity Ghana inside an embedded preview window. Open the app in a full browser tab to enable 1-click native installation:
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Full Tab to Install</span>
            </a>
          </div>
        )}

        {/* Platform-Specific Instructions */}
        {isIOS ? (
          <div className="space-y-2.5 py-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  1. Tap the Share button
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Located in the Safari toolbar at the bottom (iPhone) or top-right (iPad).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2. Tap &ldquo;Add to Home Screen&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Scroll down the share sheet menu and select Add to Home Screen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  3. Tap &ldquo;Add&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm in the top-right corner to place Opportunity Ghana on your home screen.
                </p>
              </div>
            </div>
          </div>
        ) : platformInfo.isAndroid ? (
          <div className="space-y-2.5 py-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <MoreVertical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  1. Open the Browser Menu (⋮)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap the three dots icon in the top-right corner of {platformInfo.browserName}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2. Tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the install option from the browser menu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  3. Confirm Installation
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap Install to add the standalone Opportunity Ghana app to your phone.
                </p>
              </div>
            </div>
          </div>
        ) : platformInfo.isMacSafari ? (
          <div className="space-y-2.5 py-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  1. Click File or the Share Button in Safari
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  In the top menu bar choose File, or click the Share icon in the Safari toolbar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2. Select &ldquo;Add to Dock...&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Click Add to install Opportunity Ghana as a standalone macOS app.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 py-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  1. Click the Install Icon in the Address Bar
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Look for the computer/download icon on the right side of your {platformInfo.browserName} address bar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <MoreVertical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2. Or Use the Browser Menu (⋮)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Open the browser menu → <strong>Cast, save, and share</strong> (or <strong>Apps</strong>) → <strong>Install Opportunity Ghana...</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  3. Confirm &ldquo;Install&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Opportunity Ghana will launch in its own standalone window and pin to your desktop/taskbar.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-[#006B3F] text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-[#005530] transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
