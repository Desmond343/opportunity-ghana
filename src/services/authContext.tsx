import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/database';
import { isFirebaseConfigured } from './firebase/config';
import { FirebaseAuthService } from './firebase/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseActive: boolean;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (userData: Partial<User>, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshClaims: () => Promise<void>;
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
        // Exclude and purge any previous demo user sessions
        if (
          parsed &&
          parsed.id &&
          !parsed.id.startsWith('user-standard-') &&
          !parsed.id.startsWith('user-admin-') &&
          !parsed.id.startsWith('user-editor-') &&
          !parsed.id.startsWith('user-mod-') &&
          !parsed.id.startsWith('user-org-') &&
          !parsed.id.startsWith('user-google-demo') &&
          !parsed.email?.includes('example.com')
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore parsing error
    }
    // No fake user! Real users start unauthenticated
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('opp_gh_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('opp_gh_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = FirebaseAuthService.onAuthChanged(async (fbUser) => {
        if (fbUser) {
          let isAdminFromClaim = false;
          let isEditorFromClaim = false;
          try {
            const tokenResult = await fbUser.getIdTokenResult();
            isAdminFromClaim = Boolean(tokenResult.claims?.admin);
            isEditorFromClaim = Boolean(tokenResult.claims?.editor);
          } catch {
            // Ignore claim read failure on transient network issues
          }

          const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
          if (profile) {
            if (isAdminFromClaim) {
              profile.role = 'admin';
            } else if (isEditorFromClaim && profile.role !== 'admin') {
              profile.role = 'editor';
            }
            setCurrentUser(profile);
          } else {
            setCurrentUser({
              id: fbUser.uid,
              name: fbUser.displayName || 'Opportunity Seeker',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: isAdminFromClaim ? 'admin' : isEditorFromClaim ? 'editor' : 'user',
              location: 'Accra, Ghana',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginWithPassword = async (email: string, pass: string) => {
    if (!email || !pass) {
      throw new Error('Please enter both your email and password.');
    }
    setLoading(true);
    try {
      const fbUser = await FirebaseAuthService.signInWithEmail(email, pass);
      if (fbUser) {
        const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
        if (profile) {
          setCurrentUser(profile);
          return;
        }
        setCurrentUser({
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          role: 'user',
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
      const { profile } = await FirebaseAuthService.signInWithGoogle();
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
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const refreshClaims = async () => {
    const authInstance = FirebaseAuthService.getAuthInstance();
    const fbUser = authInstance?.currentUser;
    if (fbUser) {
      try {
        const tokenResult = await fbUser.getIdTokenResult(true);
        const isAdminClaim = Boolean(tokenResult.claims?.admin);
        const isEditorClaim = Boolean(tokenResult.claims?.editor);
        if (isAdminClaim) {
          setCurrentUser(prev => prev ? { ...prev, role: 'admin' } : prev);
        } else if (isEditorClaim) {
          setCurrentUser(prev => prev ? { ...prev, role: 'editor' } : prev);
        }
      } catch (err) {
        console.warn('[Opportunity Ghana] Could not refresh token claims:', err);
      }
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isEditorOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        loginWithPassword,
        loginWithGoogle,
        signup,
        logout,
        refreshClaims,
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
