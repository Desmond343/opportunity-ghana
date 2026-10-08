import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { app, isFirebaseConfigured } from './config';
import { db, sanitizeForFirestore } from './firestoreService';
import { User, UserRole } from '../../types/database';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const auth: Auth | null = (app && isFirebaseConfigured) ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('firestore_timeout')), ms))
  ]);
}

export const FirebaseAuthService = {
  getAuthInstance(): Auth | null {
    return auth;
  },

  async signInWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async signUpWithEmail(
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<FirebaseUser | null> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;

    // Save profile to existing Firestore users collection if db is available
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const profile: User = {
          id: fbUser.uid,
          name: userData.name || fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          photoURL: fbUser.photoURL || undefined,
          role: 'user',
          location: userData.location || 'Ghana',
          educationLevel: userData.educationLevel,
          university: userData.university,
          course: userData.course,
          graduationYear: userData.graduationYear,
          skills: userData.skills || [],
          careerInterests: userData.careerInterests || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await withTimeout(setDoc(userDocRef, sanitizeForFirestore(profile), { merge: true }));
      } catch (err) {
        console.warn('[Opportunity Ghana] Could not write user profile to Firestore:', err);
      }
    }

    return fbUser;
  },

  async signInWithGoogle(): Promise<{ fbUser: FirebaseUser; profile: User }> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const tokenResult = await fbUser.getIdTokenResult();
      const isAdminFromClaim = Boolean(tokenResult.claims?.admin);

      let profile: User;
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const existing = await withTimeout(getDoc(userDocRef));
          if (existing.exists()) {
            profile = { ...existing.data(), id: fbUser.uid } as User;
            if (isAdminFromClaim) {
              profile.role = 'admin';
            }
          } else {
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Opportunity Seeker',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: isAdminFromClaim ? 'admin' : 'user',
              location: 'Ghana',
              educationLevel: 'Undergraduate (Bachelor)',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await withTimeout(setDoc(userDocRef, sanitizeForFirestore(profile), { merge: true }));
          }
        } catch {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Opportunity Seeker',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
            role: isAdminFromClaim ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Opportunity Seeker',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          role: isAdminFromClaim ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      return { fbUser, profile };
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('auth/unauthorized-domain')) {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-domain';
        const enhancedError = new Error(
          `Firebase: Error (auth/unauthorized-domain). The domain "${hostname}" is not authorized for OAuth operations in your Firebase project "opportunity-ghana".`
        );
        (enhancedError as any).code = 'auth/unauthorized-domain';
        (enhancedError as any).hostname = hostname;
        (enhancedError as any).projectId = 'opportunity-ghana';
        throw enhancedError;
      }
      throw err;
    }
  },

  async signOut(): Promise<void> {
    if (auth) {
      await fbSignOut(auth);
    }
  },

  /**
   * Request official Firebase password reset email.
   * Securely handles user enumeration prevention: returns neutral success even if email is unknown.
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      // Build continue URL back to Opportunity Ghana's reset password page
      const actionCodeSettings = typeof window !== 'undefined' ? {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      } : undefined;

      try {
        await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      } catch (err: any) {
        // If unauthorized-continue-uri error occurs (e.g. preview domain not yet in action url whitelist),
        // fallback to standard Firebase reset email without custom continue url.
        if (err?.code === 'auth/unauthorized-continue-uri') {
          await sendPasswordResetEmail(auth, cleanEmail);
        } else {
          throw err;
        }
      }

      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      };
    } catch (err: any) {
      // SECURITY: Avoid revealing whether an email is registered (account enumeration prevention)
      if (err?.code === 'auth/user-not-found') {
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.'
        };
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few moments before trying again.');
      }
      throw new Error(err?.message || 'Could not send reset link. Please try again.');
    }
  },

  /**
   * Verify password reset action code (oobCode) from email link.
   * Returns the verified account email or throws expired/invalid error.
   */
  async verifyResetCode(code: string): Promise<string> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }
    const cleanCode = (code || '').trim();
    if (!cleanCode) {
      throw new Error('Invalid or missing password reset link.');
    }

    try {
      const email = await verifyPasswordResetCode(auth, cleanCode);
      return email;
    } catch (err: any) {
      if (err?.code === 'auth/expired-action-code') {
        throw new Error('This password reset link has expired. Please request a new link.');
      }
      if (err?.code === 'auth/invalid-action-code') {
        throw new Error('This password reset link is invalid or has already been used.');
      }
      throw new Error(err?.message || 'Failed to verify reset link.');
    }
  },

  /**
   * Confirm password reset with Firebase Auth using new password.
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    if (!auth) {
      throw new Error('Authentication service is not initialized.');
    }
    const cleanCode = (code || '').trim();
    if (!cleanCode) {
      throw new Error('Invalid or missing password reset link.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      await confirmPasswordReset(auth, cleanCode, newPassword);
    } catch (err: any) {
      if (err?.code === 'auth/expired-action-code') {
        throw new Error('This password reset link has expired. Please request a new link.');
      }
      if (err?.code === 'auth/invalid-action-code') {
        throw new Error('This password reset link is invalid or has already been used.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      }
      throw new Error(err?.message || 'Could not reset password. Please try again.');
    }
  },

  onAuthChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth) {
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const snap = await withTimeout(getDoc(doc(db, 'users', uid)));
      if (snap.exists()) {
        return { ...snap.data(), id: uid } as User;
      }
    } catch (e) {
      console.debug('[Opportunity Ghana] Profile lookup fallback used:', e);
    }
    return null;
  }
};
