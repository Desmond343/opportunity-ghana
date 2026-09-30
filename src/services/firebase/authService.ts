import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { app, isFirebaseConfigured } from './config';
import { User, UserRole } from '../../types/database';
import { doc, getDoc, setDoc, getFirestore, Firestore } from 'firebase/firestore';

export const auth: Auth | null = (app && isFirebaseConfigured) ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const db: Firestore | null = (app && isFirebaseConfigured) ? getFirestore(app) : null;

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
        await setDoc(userDocRef, profile, { merge: true });
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
          const existing = await getDoc(userDocRef);
          if (existing.exists()) {
            profile = { id: existing.id, ...existing.data() } as User;
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
            await setDoc(userDocRef, profile);
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

  onAuthChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth) {
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as User;
      }
    } catch (e) {
      console.warn('[Opportunity Ghana] Error reading user profile from Firestore:', e);
    }
    return null;
  }
};
