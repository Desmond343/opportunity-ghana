import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = 'opportunity_ghana_pwa_dismissed';
const DISMISS_TIMESTAMP_KEY = 'opportunity_ghana_pwa_dismissed_at';
const INSTALLED_KEY = 'opportunity_ghana_pwa_installed';
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface BrowserPlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMacSafari: boolean;
  isChromium: boolean;
  isFirefox: boolean;
  isMobile: boolean;
  isInIframe: boolean;
  browserName: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Samsung Internet' | 'Browser';
}

function detectStandaloneInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isStandaloneMedia =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches;
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidApp = typeof document !== 'undefined' && document.referrer.includes('android-app://');
    if (isStandaloneMedia || isIOSStandalone || isAndroidApp) {
      return true;
    }
  } catch {}
  return false;
}

function detectDismissedState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const rawTs = localStorage.getItem(DISMISS_TIMESTAMP_KEY);
    if (rawTs) {
      const elapsed = Date.now() - Number(rawTs);
      if (!Number.isNaN(elapsed) && elapsed < DISMISS_COOLDOWN_MS) {
        return true;
      }
      localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
      localStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function detectBrowserPlatform(): BrowserPlatformInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isIOS: false,
      isAndroid: false,
      isMacSafari: false,
      isChromium: false,
      isFirefox: false,
      isMobile: false,
      isInIframe: false,
      browserName: 'Browser'
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS =
    (/iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  const isAndroid = /android/.test(ua);
  const isFirefox = /firefox|fxios/.test(ua);
  const isEdge = /edg\/|edga\/|edgios\//.test(ua);
  const isSamsung = /samsungbrowser/.test(ua);
  const isOpera = /opr\/|opera/.test(ua);
  const isChrome = /chrome|chromium|crios/.test(ua) && !isEdge && !isSamsung && !isOpera;
  const isChromium = isChrome || isEdge || isSamsung || isOpera;
  const isSafari = /safari/.test(ua) && !isChromium && !isFirefox;
  const isMacSafari = isSafari && !isIOS;
  const isMobile = isIOS || isAndroid || /mobile|tablet/.test(ua);

  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch {
    isInIframe = true;
  }

  let browserName: BrowserPlatformInfo['browserName'] = 'Browser';
  if (isEdge) browserName = 'Edge';
  else if (isSamsung) browserName = 'Samsung Internet';
  else if (isChrome) browserName = 'Chrome';
  else if (isSafari) browserName = 'Safari';
  else if (isFirefox) browserName = 'Firefox';

  return {
    isIOS,
    isAndroid,
    isMacSafari,
    isChromium,
    isFirefox,
    isMobile,
    isInIframe,
    browserName
  };
}

// Shared module-level state so Navbar, Mobile Menu, Banner, and Card stay 100% in sync
let sharedDeferredPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' && window.__deferredPWAInstallPrompt
    ? window.__deferredPWAInstallPrompt
    : null;
let sharedIsInstalled: boolean = detectStandaloneInstalled();
let sharedJustInstalled: boolean = false;
let sharedIsDismissed: boolean = detectDismissedState();
let globalListenersAttached = false;

function broadcastPWAStateChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pwa-state-sync'));
  }
}

function ensureGlobalListeners() {
  if (globalListenersAttached || typeof window === 'undefined') return;
  globalListenersAttached = true;

  // Pick up any prompt captured by index.html early script
  if (window.__deferredPWAInstallPrompt) {
    sharedDeferredPrompt = window.__deferredPWAInstallPrompt;
  }

  // Check if previously marked installed in localStorage (unless beforeinstallprompt has fired)
  try {
    if (!sharedDeferredPrompt && localStorage.getItem(INSTALLED_KEY) === 'true') {
      sharedIsInstalled = true;
    }
  } catch {}

  // Check Chromium getInstalledRelatedApps API if available
  const navWithRelated = window.navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<Array<{ id?: string; platform?: string; url?: string }>>;
  };
  if (typeof navWithRelated.getInstalledRelatedApps === 'function') {
    navWithRelated
      .getInstalledRelatedApps()
      .then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) {
          sharedIsInstalled = true;
          broadcastPWAStateChange();
        }
      })
      .catch(() => {});
  }

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    window.__deferredPWAInstallPrompt = promptEvent;
    sharedDeferredPrompt = promptEvent;
    // If browser fires beforeinstallprompt, the app is not currently installed
    if (!detectStandaloneInstalled()) {
      sharedIsInstalled = false;
      try {
        localStorage.removeItem(INSTALLED_KEY);
      } catch {}
    }
    broadcastPWAStateChange();
  };

  const handleEarlyPromptSignal = () => {
    if (window.__deferredPWAInstallPrompt) {
      sharedDeferredPrompt = window.__deferredPWAInstallPrompt;
      if (!detectStandaloneInstalled()) {
        sharedIsInstalled = false;
      }
      broadcastPWAStateChange();
    }
  };

  const handleAppInstalled = () => {
    window.__deferredPWAInstallPrompt = null;
    sharedDeferredPrompt = null;
    sharedIsInstalled = true;
    sharedJustInstalled = true;
    try {
      localStorage.setItem(INSTALLED_KEY, 'true');
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
    } catch {}
    broadcastPWAStateChange();

    setTimeout(() => {
      sharedJustInstalled = false;
      broadcastPWAStateChange();
    }, 6000);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('pwa-install-available', handleEarlyPromptSignal);
  window.addEventListener('appinstalled', handleAppInstalled);
  window.addEventListener('pwa-app-installed', handleAppInstalled);

  try {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        sharedIsInstalled = true;
        sharedDeferredPrompt = null;
        window.__deferredPWAInstallPrompt = null;
        broadcastPWAStateChange();
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }
  } catch {}
}

export function usePWAInstall() {
  ensureGlobalListeners();

  const [platformInfo] = useState<BrowserPlatformInfo>(() => detectBrowserPlatform());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => sharedDeferredPrompt || (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt || null : null)
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => sharedIsInstalled || detectStandaloneInstalled());
  const [justInstalled, setJustInstalled] = useState<boolean>(() => sharedJustInstalled);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => sharedIsDismissed);

  useEffect(() => {
    ensureGlobalListeners();

    const syncState = () => {
      const currentPrompt = sharedDeferredPrompt || window.__deferredPWAInstallPrompt || null;
      setDeferredPrompt(currentPrompt);
      setIsInstalled(sharedIsInstalled || detectStandaloneInstalled());
      setJustInstalled(sharedJustInstalled);
      setIsDismissed(sharedIsDismissed);
    };

    syncState();
    window.addEventListener('pwa-state-sync', syncState);
    return () => {
      window.removeEventListener('pwa-state-sync', syncState);
    };
  }, []);

  const install = useCallback(async (): Promise<InstallOutcome> => {
    let activePrompt = sharedDeferredPrompt || window.__deferredPWAInstallPrompt || deferredPrompt;

    // If prompt isn't ready yet, wait briefly in case service worker registration just completed
    if (!activePrompt) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      activePrompt = sharedDeferredPrompt || window.__deferredPWAInstallPrompt || null;
    }

    if (!activePrompt) {
      return 'unavailable';
    }

    try {
      await activePrompt.prompt();
      const choice = await activePrompt.userChoice;

      // A BeforeInstallPromptEvent can only be prompted once per browser spec
      sharedDeferredPrompt = null;
      window.__deferredPWAInstallPrompt = null;

      if (choice.outcome === 'accepted') {
        sharedIsInstalled = true;
        sharedJustInstalled = true;
        try {
          localStorage.setItem(INSTALLED_KEY, 'true');
          localStorage.removeItem(DISMISS_KEY);
          localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
        } catch {}
        broadcastPWAStateChange();

        setTimeout(() => {
          sharedJustInstalled = false;
          broadcastPWAStateChange();
        }, 6000);

        return 'accepted';
      } else {
        // User dismissed native prompt: do not repeatedly trigger the ambient prompt
        sharedIsDismissed = true;
        try {
          localStorage.setItem(DISMISS_KEY, 'true');
          localStorage.setItem(DISMISS_TIMESTAMP_KEY, String(Date.now()));
        } catch {}
        broadcastPWAStateChange();
        return 'dismissed';
      }
    } catch (err) {
      console.warn('[PWA] Installation prompt failed or was dismissed:', err);
      sharedDeferredPrompt = null;
      window.__deferredPWAInstallPrompt = null;
      broadcastPWAStateChange();
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    sharedIsDismissed = true;
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
      localStorage.setItem(DISMISS_TIMESTAMP_KEY, String(Date.now()));
    } catch {}
    broadcastPWAStateChange();
  }, []);

  const resetDismissed = useCallback(() => {
    sharedIsDismissed = false;
    try {
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
    } catch {}
    broadcastPWAStateChange();
  }, []);

  const clearJustInstalled = useCallback(() => {
    sharedJustInstalled = false;
    broadcastPWAStateChange();
  }, []);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    justInstalled,
    isIOS: platformInfo.isIOS,
    platformInfo,
    isDismissed,
    install,
    dismiss,
    resetDismissed,
    clearJustInstalled,
    deferredPrompt
  };
}
