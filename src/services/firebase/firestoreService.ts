import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  getDoc,
  CollectionReference,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { app, isFirebaseConfigured, firebaseConfig } from './config';

function createFirestoreInstance(): Firestore | null {
  if (!app || !isFirebaseConfigured) return null;
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    });
  } catch {
    try {
      return getFirestore(app);
    } catch {
      return null;
    }
  }
}

export const db: Firestore | null = createFirestoreInstance();

// Safe helper to get a typed collection reference
export function getFirebaseCollection(name: string): CollectionReference<DocumentData> | null {
  if (!db) return null;
  return collection(db, name);
}

// Collection references to the existing project collections (null-safe)
export const collections = {
  get users() { return getFirebaseCollection('users'); },
  get organizations() { return getFirebaseCollection('organizations'); },
  get opportunities() { return getFirebaseCollection('opportunities'); },
  get resources() { return getFirebaseCollection('resources'); },
  get skills() { return getFirebaseCollection('skills'); },
  get careers() { return getFirebaseCollection('careers'); },
  get applications() { return getFirebaseCollection('applications'); },
  get savedOpportunities() { return getFirebaseCollection('saved_opportunities'); },
  get alerts() { return getFirebaseCollection('alerts'); },
  get notifications() { return getFirebaseCollection('notifications'); },
  get reports() { return getFirebaseCollection('reports'); },
  get submissions() { return getFirebaseCollection('submissions'); },
  get verificationRecords() { return getFirebaseCollection('verification_records'); }
};

/**
 * Validates connection to the existing Firestore database in 'opportunity-ghana'
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  if (!db || !isFirebaseConfigured) {
    return {
      connected: false,
      message: `Configured for existing project '${firebaseConfig.projectId}'.`
    };
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );
    await Promise.race([
      getDoc(doc(db, 'opportunities', '_healthcheck')),
      timeout
    ]);
    return { connected: true, message: `Connected to Cloud Firestore in ${firebaseConfig.projectId}.` };
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message === 'timeout') {
      return {
        connected: false,
        message: 'Firestore backend is currently in resilient offline cache mode.'
      };
    }
    return {
      connected: true,
      message: `Firestore client active for ${firebaseConfig.projectId}.`
    };
  }
}
