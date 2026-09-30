import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

async function main() {
  const targetUid = process.argv[2] || process.env.ADMIN_UID;
  if (!targetUid || targetUid.trim() === '') {
    console.error('\n[Opportunity Ghana] Error: Missing Firebase Auth UID.');
    console.error('Usage:');
    console.error('  npm run set-admin -- <FIREBASE_AUTH_UID>');
    console.error('  or: ADMIN_UID=<FIREBASE_AUTH_UID> npm run set-admin\n');
    process.exit(1);
  }

  const cleanUid = targetUid.trim();

  // Search for service account credentials
  const possiblePaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), 'server', 'serviceAccountKey.json')
  ];

  const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));
  let app: App;

  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    app = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'opportunity-ghana'
        })
      : getApps()[0];
    console.log(`[Opportunity Ghana] Loaded service account credentials from: ${path.basename(serviceAccountPath)}`);
  } else {
    // Try application default credentials or projectId
    app = getApps().length === 0
      ? initializeApp({ projectId: 'opportunity-ghana' })
      : getApps()[0];
    console.log('[Opportunity Ghana] Initializing with Project ID: opportunity-ghana');
  }

  const adminAuth = getAuth(app);
  const adminDb = getFirestore(app);

  try {
    console.log(`[Opportunity Ghana] Looking up user with UID: "${cleanUid}"...`);
    const userRecord = await adminAuth.getUser(cleanUid);

    console.log(`[Opportunity Ghana] User found: ${userRecord.email || '(No email)'}`);
    console.log('[Opportunity Ghana] Setting Custom Claims: { admin: true }...');

    await adminAuth.setCustomUserClaims(cleanUid, {
      ...userRecord.customClaims,
      admin: true
    });

    // Update user document in Firestore if accessible
    try {
      await adminDb.collection('users').doc(cleanUid).set({
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('[Opportunity Ghana] Updated Firestore user document role: "admin"');
    } catch (dbErr: any) {
      console.warn('[Opportunity Ghana] Note: Could not update Firestore doc directly (rules or credentials):', dbErr.message);
    }

    console.log('\n======================================================');
    console.log(' SUCCESS: User successfully promoted to Administrator');
    console.log('======================================================');
    console.log(`UID:           ${userRecord.uid}`);
    console.log(`Email:         ${userRecord.email || 'N/A'}`);
    console.log(`Custom Claims: { admin: true }`);
    console.log('Status:        ACTIVE ADMIN');
    console.log('------------------------------------------------------');
    console.log('Important: To apply the new admin custom claim, please');
    console.log('sign out and sign back in to Opportunity Ghana to refresh');
    console.log('your Firebase ID token.\n');
    process.exit(0);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.error(`\n[Opportunity Ghana] Error: No Firebase Authentication user found with UID "${cleanUid}".`);
      console.error('Please verify the UID in your Firebase Console under Authentication -> Users.\n');
    } else if (err.code === 'app/invalid-credential' || err.message?.includes('credential') || err.message?.includes('signBlob') || err.message?.includes('IAM')) {
      console.error('\n[Opportunity Ghana] Authentication Error: Admin SDK requires Google Cloud credentials to modify custom claims.');
      console.error('To set up credentials:');
      console.error('  1. Go to Firebase Console > Project settings > Service accounts');
      console.error('  2. Click "Generate new private key"');
      console.error('  3. Save the downloaded file as "serviceAccountKey.json" in the project root');
      console.error('  4. Re-run: npm run set-admin -- ' + cleanUid + '\n');
    } else {
      console.error('\n[Opportunity Ghana] Error setting admin claims:', err.message || err);
    }
    process.exit(1);
  }
}

main();
