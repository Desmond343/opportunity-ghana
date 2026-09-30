import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/database';
import { isFirebaseConfigured } from './firebase/config';
import { FirebaseAuthService } from './firebase/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseActive: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (userData: Partial<User>, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isEditorOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo test profiles for easy developer/admin verification
export const DEMO_PROFILES: Record<UserRole, User> = {
  admin: {
    id: 'user-admin-01',
    name: 'Kwame Mensah (Admin)',
    email: 'admin@opportunityghana.com',
    role: 'admin',
    location: 'Accra, Ghana',
    educationLevel: 'Postgraduate (Master / PhD)',
    university: 'University of Ghana, Legon',
    course: 'Computer Science & Public Policy',
    skills: ['Data Architecture', 'Public Administration', 'Platform Security'],
    careerInterests: ['Civic Tech', 'Higher Education Policy'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  editor: {
    id: 'user-editor-01',
    name: 'Ama Osei (Editor)',
    email: 'editor@opportunityghana.com',
    role: 'editor',
    location: 'Kumasi, Ghana',
    educationLevel: 'Undergraduate (Bachelor)',
    university: 'KNUST',
    course: 'Publishing Studies & Communication',
    skills: ['Content Verification', 'Fact Checking', 'Editorial Standards'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  },
  moderator: {
    id: 'user-mod-01',
    name: 'Kofi Boateng (Moderator)',
    email: 'moderator@opportunityghana.com',
    role: 'moderator',
    location: 'Takoradi, Ghana',
    educationLevel: 'Diploma / HND',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  },
  organization: {
    id: 'user-org-01',
    name: 'MEST Partner Rep',
    email: 'partners@mest.africa',
    role: 'organization',
    location: 'Accra, Ghana',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z'
  },
  user: {
    id: 'user-standard-01',
    name: 'Abena Danso',
    email: 'abena.danso@student.edu.gh',
    role: 'user',
    location: 'Cape Coast, Central Region',
    educationLevel: 'Undergraduate (Bachelor)',
    university: 'University of Cape Coast (UCC)',
    course: 'BSc Information Technology',
    graduationYear: 2026,
    skills: ['JavaScript', 'React', 'Python', 'Digital Marketing'],
    careerInterests: ['Software Engineering', 'Fintech', 'Graduate Scholarships'],
    preferredOpportunityTypes: ['Internships', 'Jobs', 'Scholarships'],
    preferredLocations: ['Greater Accra', 'Central', 'Remote / Online'],
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z'
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('opp_gh_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return DEMO_PROFILES.user;
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
          const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            setCurrentUser({
              id: fbUser.uid,
              name: fbUser.displayName || 'Opportunity Seeker',
              email: fbUser.email || 'user@opportunityghana.com',
              photoURL: fbUser.photoURL || undefined,
              role: 'user',
              location: 'Accra, Ghana',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, role: UserRole = 'user') => {
    setLoading(true);
    try {
      const matchedProfile = DEMO_PROFILES[role] || {
        ...DEMO_PROFILES.user,
        email,
        name: email.split('@')[0]
      };
      setCurrentUser(matchedProfile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const fbUser = await FirebaseAuthService.signInWithEmail(email, pass);
        if (fbUser) {
          const profile = await FirebaseAuthService.getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            return;
          }
        }
      }
      // Resilient fallback
      await login(email, 'user');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const { profile } = await FirebaseAuthService.signInWithGoogle();
        setCurrentUser(profile);
        return;
      }
      // Demo fallback
      setCurrentUser(DEMO_PROFILES.user);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Partial<User>, password?: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && userData.email && password) {
        await FirebaseAuthService.signUpWithEmail(userData.email, password, userData);
      }
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: userData.name || 'Opportunity Seeker',
        email: userData.email || 'seeker@example.com',
        role: userData.role || 'user',
        location: userData.location || 'Accra, Ghana',
        educationLevel: userData.educationLevel || 'Undergraduate (Bachelor)',
        university: userData.university || '',
        course: userData.course || '',
        graduationYear: userData.graduationYear || 2026,
        skills: userData.skills || [],
        careerInterests: userData.careerInterests || [],
        preferredOpportunityTypes: userData.preferredOpportunityTypes || [],
        preferredLocations: userData.preferredLocations || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await FirebaseAuthService.signOut();
      } catch (err) {
        console.error('Firebase sign out error:', err);
      }
    }
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const profile = DEMO_PROFILES[newRole];
    if (profile) {
      setCurrentUser({ ...profile });
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
        login,
        loginWithPassword,
        loginWithGoogle,
        signup,
        logout,
        switchRole,
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
