import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from './firebaseAdmin.ts';
import fs from 'fs';
import path from 'path';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: 'admin' | 'editor' | 'user' | 'organization';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Load Firebase Web Config for REST fallback if needed
let firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || '';
if (!firebaseApiKey) {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      firebaseApiKey = config.apiKey || '';
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }
}

/**
 * Verifies a Firebase ID token and retrieves the user's authoritative role.
 */
export async function verifyUserToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token || typeof token !== 'string') return null;

  let uid = '';
  let email = '';
  let customClaimsRole: string | undefined;

  // 1. Try Firebase Admin SDK verification
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
      email = decoded.email || '';
      if (decoded.admin === true || decoded.role === 'admin') {
        customClaimsRole = 'admin';
      } else if (decoded.editor === true || decoded.role === 'editor') {
        customClaimsRole = 'editor';
      }
    } catch (e: any) {
      // If adminAuth verification failed, try REST API fallback below
      // console.debug('adminAuth.verifyIdToken failed:', e.message);
    }
  }

  // 2. REST API Fallback via Google Identity Toolkit
  if (!uid && firebaseApiKey) {
    try {
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token })
        }
      );
      if (resp.ok) {
        const data = await resp.json() as any;
        if (data.users && data.users.length > 0) {
          uid = data.users[0].localId;
          email = data.users[0].email || '';
          if (data.users[0].customAttributes) {
            try {
              const attrs = JSON.parse(data.users[0].customAttributes);
              if (attrs.admin === true || attrs.role === 'admin') customClaimsRole = 'admin';
              if (attrs.editor === true || attrs.role === 'editor') customClaimsRole = 'editor';
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('Identity toolkit lookup error:', err);
    }
  }

  if (!uid) {
    return null;
  }

  // 3. Authoritative role check: Check Firestore /users/{uid} document
  let finalRole: AuthenticatedUser['role'] = (customClaimsRole as AuthenticatedUser['role']) || 'user';

  if (adminDb) {
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data && data.role) {
          finalRole = data.role as AuthenticatedUser['role'];
        }
      }
    } catch (e: any) {
      // console.warn('Error reading user role from adminDb:', e.message);
    }
  }

  // Fallback check using REST API if adminDb not connected
  if (finalRole === 'user' && firebaseApiKey) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/opportunity-ghana/databases/(default)/documents/users/${uid}`;
      const docResp = await fetch(firestoreUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (docResp.ok) {
        const docData = await docResp.json() as any;
        const roleField = docData.fields?.role?.stringValue;
        if (roleField === 'admin' || roleField === 'editor') {
          finalRole = roleField;
        }
      }
    } catch {}
  }

  return {
    uid,
    email,
    role: finalRole
  };
}

/**
 * Express middleware to strictly require Administrator or Editor privileges.
 * Non-admins receive HTTP 403 Forbidden. Unauthenticated requests receive HTTP 401 Unauthorized.
 */
export async function requireAdminOrEditor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Prevent any shared caching of administrative API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required.',
      authorized: false
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Malformed authorization header.',
      authorized: false
    });
  }

  try {
    const verifiedUser = await verifyUserToken(token);
    if (!verifiedUser) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired authentication token.',
        authorized: false
      });
    }

    if (verifiedUser.role !== 'admin' && verifiedUser.role !== 'editor') {
      return res.status(403).json({
        error: 'Forbidden: Administrator privileges required to access this resource.',
        authorized: false,
        userRole: verifiedUser.role
      });
    }

    req.user = verifiedUser;
    next();
  } catch (err: any) {
    console.error('requireAdminOrEditor error:', err);
    return res.status(500).json({
      error: 'Authentication error during authorization check.',
      authorized: false
    });
  }
}

/**
 * Express middleware to require only Admin role (for sensitive user management / role alteration).
 */
export async function requireAdminOnly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required.',
      authorized: false
    });
  }

  const token = authHeader.substring(7).trim();
  const verifiedUser = await verifyUserToken(token);
  if (!verifiedUser) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired authentication token.',
      authorized: false
    });
  }

  if (verifiedUser.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Full Administrator privileges required.',
      authorized: false,
      userRole: verifiedUser.role
    });
  }

  req.user = verifiedUser;
  next();
}
