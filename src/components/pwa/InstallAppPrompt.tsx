import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface InstallAppPromptProps {
  variant?: 'banner' | 'card' | 'navbar';
}

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed, never show installation prompts
  if (isInstalled) {
    return null;
  }

  // If dismissed by user and not requested as a navbar button, do not show
  if (isDismissed && variant !== 'navbar') {
    return null;
  }

  // Neither installable via beforeinstallprompt nor iOS Safari -> hide ambient banner
  if (!isInstallable && !isIOS && variant !== 'navbar') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // 1. Compact Navbar Button Variant
  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 hover:text-emerald-900 transition-all shadow-xs cursor-pointer"
          title="Install Opportunity Ghana app"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
          <span>Install App</span>
        </button>

        {/* iOS Guided Modal */}
        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  // 2. Standalone Card Variant (e.g. for Home or Profile pages)
  if (variant === 'card') {
    return (
      <>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-6 shadow-xl border border-emerald-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
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
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            </div>
          </div>
        </div>

        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  // 3. Floating Bottom Banner Variant (Default)
  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
        <div className="relative rounded-2xl bg-white p-4 shadow-2xl border border-emerald-100 ring-1 ring-slate-900/5">
          <button
            onClick={dismiss}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-1 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src="/icon-192.png"
                alt="Opportunity Ghana Icon"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Install Opportunity Ghana
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Get quick access to jobs, scholarships, courses, internships and more.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isInstalling ? 'Installing...' : 'Install App'}
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
};

// Guided iOS Install Modal for Safari Users
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-192.png"
              alt="Opportunity Ghana"
              className="w-8 h-8 rounded-lg shadow-xs"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Install on iPhone / iPad
              </h3>
              <p className="text-[11px] text-slate-500">
                Add to your Home Screen in 3 steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 py-1">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                1. Tap the Share button
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Located at the bottom of Safari on iPhone or top right on iPad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                2. Select &ldquo;Add to Home Screen&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Scroll down the share sheet menu to find this option.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                3. Tap &ldquo;Add&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Confirm at the top-right corner to place the app on your home screen.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
