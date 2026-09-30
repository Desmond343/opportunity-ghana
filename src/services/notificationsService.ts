/**
 * Opportunity Ghana - Push Notification Architecture (FCM Ready)
 * 
 * Prepares the architecture for Firebase Cloud Messaging (FCM) and Web Push notifications:
 * - New jobs, scholarships, internships, and courses
 * - Closing deadline reminders for saved opportunities
 * - Application status updates
 * 
 * Note: If VAPID keys or FCM credentials are not configured, the service
 * gracefully explains that push notifications will activate when credentials are set up.
 */

export interface NotificationPreferences {
  enabled: boolean;
  categories: string[];
  deadlines: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

const PREFS_KEY = 'opp_gh_notification_preferences';

export const PushNotificationService = {
  isPushSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  },

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isPushSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission(): Promise<{ granted: boolean; status: string; fcmReady: boolean }> {
    if (!this.isPushSupported()) {
      return { granted: false, status: 'unsupported', fcmReady: false };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      // Check if FCM Web Push VAPID key is configured in env
      const hasVapidKey = Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);

      return {
        granted,
        status: permission,
        fcmReady: hasVapidKey
      };
    } catch (err) {
      console.warn('[Opportunity Ghana] Push permission request error:', err);
      return { granted: false, status: 'denied', fcmReady: false };
    }
  },

  getPreferences(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      enabled: false,
      categories: ['Scholarships', 'Jobs', 'Internships'],
      deadlines: true,
      frequency: 'instant'
    };
  },

  savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }
};
