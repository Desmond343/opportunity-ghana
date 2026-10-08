import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types/database';
import { isFirebaseConfigured } from './firebase/config';
import { FirebaseAuthService } from './firebase/authService';
import { SavedService } from './savedService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: any;
  claims: Record<string, any>;
  loading: boolean;
  isFirebaseActive: boolean;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (userData: Partial<User>, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmPasswordReset: (code: string, newPass: string) => Promise<void>;
  refreshClaims: () => Promise<boolean>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  isAdmin: boolean;
  isEditorOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('opp_gh_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.id &&
          !parsed.id.startsWith('user-demo-') &&
          !parsed.id.startsWith('user-mock-') &&
          !parsed.email?.includes('example.com')
        ) {
          // Never trust stored 'admin' role until verified by Firebase token claims
          if (parsed.role === 'admin') {
            parsed.role = 'user';
          }
          return parsed;
        }
      }
    } catch {
      // ignore parsing error
    }
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    const authInstance = FirebaseAuthService.getAuthInstance();
    const activeUser = authInstance?.currentUser || firebaseUser;
    if (!activeUser) return null;
    try {
      return await activeUser.getIdToken(forceRefresh);
    } catch (err) {
      console.warn('[Opportunity Ghana] Failed to get ID token:', err);
      return null;
    }
  }, [firebaseUser]);

  // Sync basic user info to localStorage and initialize SavedService
  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem('opp_gh_auth_user', JSON.stringify(currentUser));
      SavedService.initForUser(currentUser.id, getIdToken).catch((err) => {
        console.warn('[SavedService] initForUser error:', err);
      });
    } else if (!currentUser) {
      localStorage.removeItem('opp_gh_auth_user');
      SavedService.clearUser();
    }
  }, [currentUser, getIdToken]);

  // Read Firebase auth state and custom claims
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = FirebaseAuthService.onAuthChanged(async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          // Immediately ensure currentUser is populated with fbUser.uid so saves never miss userId
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Opportunity Seeker',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
            role: 'user',
            location: 'Accra, Ghana',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCurrentUser((prev) => (prev && prev.id === fbUser.uid ? prev : fallbackUser));

          try {
            // Read custom claims from Firebase ID Token
            const tokenResult = await fbUser.getIdTokenResult();
            const userClaims = tokenResult.claims || {};
            setClaims(userClaims);

            const isAdm = userClaims.admin === true;
            const isEdt = userClaims.editor === true;

            const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
            const verifiedRole: UserRole = isAdm ? 'admin' : isEdt ? 'editor' : 'user';

            if (profile) {
              setCurrentUser({
                ...profile,
                id: fbUser.uid,
                role: verifiedRole
              });
            } else {
              setCurrentUser({
                ...fallbackUser,
                role: verifiedRole
              });
            }
          } catch (err) {
            console.warn('[Opportunity Ghana] Auth claim evaluation notice:', err);
          }
        } else {
          setClaims({});
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const refreshClaims = useCallback(async (): Promise<boolean> => {
    const authInstance = FirebaseAuthService.getAuthInstance();
    const activeUser = authInstance?.currentUser || firebaseUser;
    if (!activeUser) return false;

    setLoading(true);
    try {
      // Force token refresh from Firebase Auth server
      const tokenResult = await activeUser.getIdTokenResult(true);
      const userClaims = tokenResult.claims || {};
      setClaims(userClaims);

      const isAdm = userClaims.admin === true;
      const isEdt = userClaims.editor === true;
      const verifiedRole: UserRole = isAdm ? 'admin' : isEdt ? 'editor' : 'user';

      setCurrentUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          role: verifiedRole
        };
      });

      return isAdm;
    } catch (err) {
      console.warn('[Opportunity Ghana] Token claim refresh error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  const loginWithPassword = async (email: string, pass: string) => {
    if (!email || !pass) {
      throw new Error('Please enter both your email and password.');
    }
    setLoading(true);
    try {
      const fbUser = await FirebaseAuthService.signInWithEmail(email, pass);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const tokenResult = await fbUser.getIdTokenResult(true);
        const userClaims = tokenResult.claims || {};
        setClaims(userClaims);

        const isAdm = userClaims.admin === true;
        const isEdt = userClaims.editor === true;
        const verifiedRole: UserRole = isAdm ? 'admin' : isEdt ? 'editor' : 'user';

        const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
        if (profile) {
          profile.role = verifiedRole;
          setCurrentUser(profile);
          return;
        }
        setCurrentUser({
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          role: verifiedRole,
          location: 'Ghana',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { fbUser, profile } = await FirebaseAuthService.signInWithGoogle();
      setFirebaseUser(fbUser);
      const tokenResult = await fbUser.getIdTokenResult(true);
      const userClaims = tokenResult.claims || {};
      setClaims(userClaims);

      const isAdm = userClaims.admin === true;
      const isEdt = userClaims.editor === true;
      const verifiedRole: UserRole = isAdm ? 'admin' : isEdt ? 'editor' : 'user';

      profile.role = verifiedRole;
      setCurrentUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Partial<User>, password?: string) => {
    if (!userData.email || !password) {
      throw new Error('Valid email address and password are required to register.');
    }
    setLoading(true);
    try {
      const fbUser = await FirebaseAuthService.signUpWithEmail(userData.email, password, userData);
      if (fbUser) {
        setFirebaseUser(fbUser);
        setClaims({});
        const profile: User = {
          id: fbUser.uid,
          name: userData.name || fbUser.displayName || userData.email.split('@')[0],
          email: fbUser.email || userData.email,
          role: 'user', // Security: Registrations always default to standard user
          location: userData.location || 'Ghana',
          educationLevel: userData.educationLevel,
          university: userData.university,
          course: userData.course,
          graduationYear: userData.graduationYear,
          skills: userData.skills || [],
          careerInterests: userData.careerInterests || [],
          preferredOpportunityTypes: userData.preferredOpportunityTypes || [],
          preferredLocations: userData.preferredLocations || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCurrentUser(profile);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await FirebaseAuthService.signOut();
    } catch (err) {
      console.error('Firebase sign out error:', err);
    } finally {
      SavedService.clearUser();
      setFirebaseUser(null);
      setClaims({});
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const sendPasswordReset = useCallback(async (email: string) => {
    return await FirebaseAuthService.sendPasswordReset(email);
  }, []);

  const verifyResetCode = useCallback(async (code: string) => {
    return await FirebaseAuthService.verifyResetCode(code);
  }, []);

  const confirmPasswordReset = useCallback(async (code: string, newPass: string) => {
    return await FirebaseAuthService.confirmPasswordReset(code, newPass);
  }, []);

  // Trusted authorization: Evaluated from Firebase Auth custom claims
  const isAdmin = Boolean(claims.admin === true);
  const isEditorOrAdmin = Boolean(claims.admin === true || claims.editor === true);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        claims,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        loginWithPassword,
        loginWithGoogle,
        signup,
        logout,
        sendPasswordReset,
        verifyResetCode,
        confirmPasswordReset,
        refreshClaims,
        getIdToken,
        isAdmin,
        isEditorOrAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
