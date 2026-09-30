import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
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
    path.resolve(process.cwd(), 'server', 'serviceAccountKey.json')
  ];
  
  const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));
  
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const app: App = getApps().length === 0 
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'opportunity-ghana',
          storageBucket: `${serviceAccount.project_id || 'opportunity-ghana'}.appspot.com`
        })
      : getApps()[0];

    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
    adminStorage = getStorage(app);
    isInitialized = true;
    console.info('[Opportunity Ghana Backend] Firebase Admin SDK initialized for project:', serviceAccount.project_id);
  } else {
    console.warn('[Opportunity Ghana Backend] service-account.json or serviceAccountKey.json not found. Admin SDK not initialized.');
  }
} catch (error) {
  console.error('[Opportunity Ghana Backend] Error initializing Firebase Admin SDK:', error);
}

export { adminDb, adminAuth, adminStorage, isInitialized };
