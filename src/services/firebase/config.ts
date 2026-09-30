import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

/**
 * Opportunity Ghana - Firebase Project Configuration
 * Project ID: opportunity-ghana
 * Hosting Site: opportunity-ghana
 */
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAkLcE44CGtDEdkNnoaKQve2XAuA-UyRjk').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'opportunity-ghana.firebaseapp.com').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'opportunity-ghana').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'opportunity-ghana.firebasestorage.app').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '819918980574').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '1:819918980574:web:60476801ff66efd572094f').trim(),
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-MLL1K4KFKK').trim()
};

// Check if live API key is valid (not empty, not placeholder)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 15 &&
  firebaseConfig.apiKey !== 'your-api-key' &&
  !firebaseConfig.apiKey.includes('your-') &&
  !firebaseConfig.apiKey.includes('MY_') &&
  firebaseConfig.projectId === 'opportunity-ghana'
);

let appInstance: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    console.info('[Opportunity Ghana] Firebase initialized successfully with project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('[Opportunity Ghana] Error during Firebase initializeApp:', error);
    appInstance = null;
  }
} else {
  console.info('[Opportunity Ghana] Target Firebase Project: opportunity-ghana. Resilient offline/demo mode active.');
}

export const app: FirebaseApp | null = appInstance;

// Firebase Analytics is optional and triggers Firebase Installations network requests.
// We export null to prevent background 400 installations/request-failed errors.
export const analytics = null;


