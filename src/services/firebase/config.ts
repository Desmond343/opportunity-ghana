import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseAppletConfig from '../../../firebase-applet-config.json';

/**
 * Opportunity Ghana - Firebase Project Configuration
 * Reads from firebase-applet-config.json with optional VITE_ environment overrides
 */
const getEnv = (key: string): string => {
  let val = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    val = (import.meta as any).env[key] || '';
  } else if (typeof process !== 'undefined' && process.env) {
    val = process.env[key] || '';
  }
  const trimmed = (val || '').trim();
  if (!trimmed || trimmed === 'your-api-key' || trimmed.startsWith('your-') || trimmed.includes('MY_')) {
    return '';
  }
  return trimmed;
};

export const firebaseConfig = {
  apiKey: (getEnv('VITE_FIREBASE_API_KEY') || firebaseAppletConfig.apiKey || '').trim(),
  authDomain: (getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseAppletConfig.authDomain || '').trim(),
  projectId: (getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseAppletConfig.projectId || '').trim(),
  storageBucket: (getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseAppletConfig.storageBucket || '').trim(),
  messagingSenderId: (getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseAppletConfig.messagingSenderId || '').trim(),
  appId: (getEnv('VITE_FIREBASE_APP_ID') || firebaseAppletConfig.appId || '').trim(),
  measurementId: (getEnv('VITE_FIREBASE_MEASUREMENT_ID') || firebaseAppletConfig.measurementId || '').trim()
};

// Check if live API key is valid (not empty, not placeholder)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 15 &&
  firebaseConfig.apiKey !== 'your-api-key' &&
  !firebaseConfig.apiKey.includes('your-') &&
  !firebaseConfig.apiKey.includes('MY_') &&
  firebaseConfig.projectId
);

let appInstance: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    console.info('[Opportunity Ghana] Firebase initialized successfully with project:', firebaseConfig.projectId);

    // Initialize Firebase Analytics in supported browser environments
    if (typeof window !== 'undefined' && appInstance) {
      isSupported().then((supported) => {
        if (supported && appInstance) {
          try {
            analyticsInstance = getAnalytics(appInstance);
          } catch {
            // Non-blocking analytics
          }
        }
      }).catch(() => {
        // Analytics is optional and non-blocking
      });
    }
  } catch (error) {
    console.warn('[Opportunity Ghana] Error during Firebase initializeApp:', error);
    appInstance = null;
  }
} else {
  console.info('[Opportunity Ghana] Target Firebase Project: opportunity-ghana. Resilient offline/demo mode active.');
}

export const app: FirebaseApp | null = appInstance;
export const analytics: Analytics | null = analyticsInstance;
export default app;


