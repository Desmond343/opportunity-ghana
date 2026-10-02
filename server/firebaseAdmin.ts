import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let adminStorage: Storage | null = null;
let isInitialized = false;

try {
  const possiblePaths = [
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'server', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'config', 'serviceAccountKey.json')
  ];

  let serviceAccount: any = null;
  const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));

  if (serviceAccountPath) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.info('[Opportunity Ghana Backend] Loaded service account from:', path.basename(serviceAccountPath));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      serviceAccount = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      console.info('[Opportunity Ghana Backend] Loaded service account from FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    } catch (e: any) {
      console.warn('[Opportunity Ghana Backend] Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    }
  }

  const app: App = getApps().length === 0
    ? (serviceAccount
        ? initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || 'opportunity-ghana',
            storageBucket: `${serviceAccount.project_id || 'opportunity-ghana'}.firebasestorage.app`
          })
        : initializeApp({
            projectId: 'opportunity-ghana',
            storageBucket: 'opportunity-ghana.firebasestorage.app'
          }))
    : getApps()[0];

  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
  try {
    adminDb.settings({ ignoreUndefinedProperties: true });
  } catch (e: any) {
    console.debug('adminDb.settings note:', e?.message || e);
  }
  adminStorage = getStorage(app);
  isInitialized = Boolean(serviceAccount);
  
  console.info(`[Opportunity Ghana Backend] Firebase Admin SDK active (serviceAccount: ${Boolean(serviceAccount)}, verifyReady: ${Boolean(adminAuth)})`);
} catch (error) {
  console.error('[Opportunity Ghana Backend] Error initializing Firebase Admin SDK:', error);
}

export { adminDb, adminAuth, adminStorage, isInitialized };

