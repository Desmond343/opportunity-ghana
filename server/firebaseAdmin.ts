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
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'server', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'config', 'serviceAccountKey.json')
  ].filter(Boolean) as string[];

  let serviceAccount: any = null;
  const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));

  if (serviceAccountPath) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.info('[Opportunity Ghana Backend] Loaded service account from file:', path.basename(serviceAccountPath));
    } catch (readErr: any) {
      console.warn('[Opportunity Ghana Backend] Could not read service account file:', readErr.message);
    }
  }

  // Check multiple common environment variable names for service account JSON or Base64
  if (!serviceAccount) {
    const rawEnv = 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      process.env.FIREBASE_ADMIN_CREDENTIALS ||
      process.env.SERVICE_ACCOUNT_KEY;

    if (rawEnv && typeof rawEnv === 'string') {
      try {
        let clean = rawEnv.trim();
        if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
          clean = clean.slice(1, -1).trim();
        }
        serviceAccount = clean.startsWith('{')
          ? JSON.parse(clean)
          : JSON.parse(Buffer.from(clean, 'base64').toString('utf8'));
        console.info('[Opportunity Ghana Backend] Loaded service account from environment variable JSON/Base64.');
      } catch (parseErr: any) {
        console.warn('[Opportunity Ghana Backend] Could not parse service account environment variable:', parseErr.message);
      }
    }
  }

  // Fallback: Check individual environment variables (client email and private key)
  if (!serviceAccount) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (clientEmail && privateKey) {
      serviceAccount = {
        client_email: clientEmail.trim(),
        private_key: privateKey.trim(),
        project_id: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'opportunity-ghana'
      };
      console.info('[Opportunity Ghana Backend] Loaded service account from discrete client email and private key env vars.');
    }
  }

  // Critical fix: Handle multiline private key formatting with escaped newlines (e.g. \\n)
  if (serviceAccount && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  const projectId = 
    serviceAccount?.project_id ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'opportunity-ghana';

  let app: App;
  if (getApps().length === 0) {
    if (serviceAccount && serviceAccount.private_key && serviceAccount.client_email) {
      try {
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId,
          storageBucket: `${projectId}.firebasestorage.app`
        });
        isInitialized = true;
      } catch (certErr: any) {
        console.error('[Opportunity Ghana Backend] cert(serviceAccount) failed:', certErr.message);
        // Fall back to uncredentialed init rather than crashing module
        app = initializeApp({
          projectId,
          storageBucket: `${projectId}.firebasestorage.app`
        });
        isInitialized = false;
      }
    } else {
      app = initializeApp({
        projectId,
        storageBucket: `${projectId}.firebasestorage.app`
      });
      isInitialized = false;
    }
  } else {
    app = getApps()[0];
    isInitialized = Boolean(serviceAccount);
  }

  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
  try {
    adminDb.settings({ ignoreUndefinedProperties: true });
  } catch (e: any) {
    console.debug('adminDb.settings note:', e?.message || e);
  }
  adminStorage = getStorage(app);
  
  console.info(`[Opportunity Ghana Backend] Firebase Admin SDK active (projectId: "${projectId}", serviceAccount: ${isInitialized}, authReady: ${Boolean(adminAuth)}, dbReady: ${Boolean(adminDb)})`);
} catch (error) {
  console.error('[Opportunity Ghana Backend] Error initializing Firebase Admin SDK:', error);
}

export { adminDb, adminAuth, adminStorage, isInitialized };

