import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

/**
 * Opportunity Ghana - Secure Administrator Provisioning Script
 * 
 * Usage:
 *   npm run set-admin -- aimarketing429@gmail.com
 *   npm run set-admin -- kojoasare293@gmail.com
 *   npm run set-admin -- <FIREBASE_UID>
 */

function initializeFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 1. Check for service account key in environment variable (JSON string or base64)
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envKey) {
    try {
      const raw = envKey.startsWith('{') ? envKey : Buffer.from(envKey, 'base64').toString('utf8');
      const parsed = JSON.parse(raw);
      console.log(`[Opportunity Ghana] Loaded credentials from FIREBASE_SERVICE_ACCOUNT_KEY environment variable.`);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || 'opportunity-ghana'
      });
    } catch (e: any) {
      console.warn(`[Opportunity Ghana] Warning: Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:`, e.message);
    }
  }

  // 2. Check for service account JSON files on disk
  const possiblePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), 'server', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'server', 'service-account.json')
  ].filter(Boolean) as string[];

  const foundPath = possiblePaths.find(p => fs.existsSync(p));
  if (foundPath) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(foundPath, 'utf8'));
      console.log(`[Opportunity Ghana] Loaded service account credentials from: ${path.basename(foundPath)}`);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'opportunity-ghana'
      });
    } catch (e: any) {
      console.warn(`[Opportunity Ghana] Warning: Error reading service account file "${foundPath}":`, e.message);
    }
  }

  // 3. Fallback to default projectId
  console.log('[Opportunity Ghana] Initializing Admin SDK with Project ID: opportunity-ghana');
  return initializeApp({ projectId: 'opportunity-ghana' });
}

async function promoteAccount(adminAuth: any, adminDb: any, identifier: string): Promise<boolean> {
  const cleanId = identifier.trim();
  const isEmail = cleanId.includes('@');

  console.log(`\n------------------------------------------------------`);
  console.log(`[Opportunity Ghana] Looking up user: "${cleanId}"...`);

  let userRecord: UserRecord;
  try {
    if (isEmail) {
      userRecord = await adminAuth.getUserByEmail(cleanId.toLowerCase());
    } else {
      userRecord = await adminAuth.getUser(cleanId);
    }
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.error(`[Opportunity Ghana] ❌ User not found in Firebase Auth: "${cleanId}"`);
      console.error(`   Ensure the user has created an account in Firebase project "opportunity-ghana".`);
      return false;
    }
    throw err;
  }

  const existingClaims = userRecord.customClaims || {};
  const updatedClaims = {
    ...existingClaims,
    admin: true
  };

  console.log(`[Opportunity Ghana] Found user: ${userRecord.email || '(No email)'} (UID: ${userRecord.uid})`);
  console.log(`[Opportunity Ghana] Email Verified: ${userRecord.emailVerified ? 'Yes' : 'No'}`);
  console.log(`[Opportunity Ghana] Existing claims:`, existingClaims);
  console.log(`[Opportunity Ghana] Preserving existing claims and applying { admin: true }...`);

  await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);

  // Sync with Firestore users collection if possible
  try {
    if (adminDb) {
      await adminDb.collection('users').doc(userRecord.uid).set({
        role: 'admin',
        email: userRecord.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[Opportunity Ghana] Synced Firestore document /users/${userRecord.uid} -> role: "admin"`);
    }
  } catch (dbErr: any) {
    console.warn(`[Opportunity Ghana] Note: Could not sync Firestore doc (credential or rule restriction):`, dbErr.message);
  }

  console.log('\n======================================================');
  console.log(' ✅ SUCCESS: Administrator Custom Claim Assigned');
  console.log('======================================================');
  console.log(`Firebase UID:    ${userRecord.uid}`);
  console.log(`Email:           ${userRecord.email || 'N/A'}`);
  console.log(`Email Verified:  ${userRecord.emailVerified ? 'Yes' : 'No'}`);
  console.log(`Custom Claims:   ${JSON.stringify(updatedClaims)}`);
  console.log(`Admin Status:    ACTIVE (admin: true)`);
  console.log(`CMS Access:      Enabled`);
  console.log('------------------------------------------------------');
  console.log('Important: If the user is currently logged in:');
  console.log('1. They can click "Refresh Permissions" in the app, or');
  console.log('2. Sign out and sign back in to obtain a fresh ID token.');
  console.log('======================================================\n');
  return true;
}

async function main() {
  const args = process.argv.slice(2).filter(a => a && !a.startsWith('-'));
  const targets = args.length > 0 
    ? args 
    : [process.env.ADMIN_EMAIL || process.env.ADMIN_UID].filter(Boolean) as string[];

  if (targets.length === 0) {
    console.log('\n[Opportunity Ghana] Administrator Provisioning Tool');
    console.log('======================================================');
    console.log('Usage:');
    console.log('  npm run set-admin -- <email-or-uid>');
    console.log('\nExamples:');
    console.log('  npm run set-admin -- aimarketing429@gmail.com');
    console.log('  npm run set-admin -- kojoasare293@gmail.com');
    console.log('======================================================\n');
    process.exit(1);
  }

  let app: App;
  try {
    app = initializeFirebaseAdminApp();
  } catch (err: any) {
    console.error('[Opportunity Ghana] Failed to initialize Firebase Admin SDK:', err.message || err);
    process.exit(1);
  }

  const adminAuth = getAuth(app);
  let adminDb = null;
  try {
    adminDb = getFirestore(app);
  } catch {
    // optional Firestore sync
  }

  let successCount = 0;
  let failCount = 0;

  for (const target of targets) {
    try {
      const ok = await promoteAccount(adminAuth, adminDb, target);
      if (ok) successCount++;
      else failCount++;
    } catch (err: any) {
      failCount++;
      if (
        err.code === 'app/invalid-credential' ||
        err.message?.includes('credential') ||
        err.message?.includes('signBlob') ||
        err.message?.includes('IAM') ||
        err.message?.includes('identitytoolkit.googleapis.com')
      ) {
        console.error(`\n[Opportunity Ghana] ❌ Google Cloud / Firebase Admin Credential Notice:`);
        console.error(`The Admin SDK requires service account credentials for project "opportunity-ghana" to manage custom claims.`);
        console.error(`To provide credentials:`);
        console.error(`  1. Go to Firebase Console > Project Settings > Service Accounts`);
        console.error(`  2. Click "Generate new private key"`);
        console.error(`  3. Save the file as "serviceAccountKey.json" in the project root, or set FIREBASE_SERVICE_ACCOUNT_KEY`);
        console.error(`  4. Re-run: npm run set-admin -- ${target}\n`);
      } else {
        console.error(`\n[Opportunity Ghana] ❌ Error provisioning ${target}:`, err.message || err);
      }
    }
  }

  if (failCount > 0 && successCount === 0) {
    process.exit(1);
  }
}

main();
