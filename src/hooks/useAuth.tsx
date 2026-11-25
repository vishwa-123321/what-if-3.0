import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthActionResult,
  getStoredDemoUser,
  registerWithEmail,
  saveDemoUser,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogleOAuth,
  signOutAccount,
} from '../services/authService';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import { DemoUser } from '../types';

interface AuthContextValue {
  user: DemoUser | null;
  isSupabaseReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ ok: boolean; isDemo: boolean; message: string; error?: string }>;
  logout: () => Promise<void>;
  toggleFavoriteGenre: (genreId: string) => void;
  updateProfileBio: (name: string, bio: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => getStoredDemoUser());
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured());
  const isSupabaseReady = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) {
        setUser({
          id: data.user.id,
          name: String(
            data.user.user_metadata?.full_name ??
              data.user.email?.split('@')[0] ??
              'Reader',
          ),
          email: data.user.email ?? '',
          bio: 'Connected reader account.',
          favoriteGenreIds: ['genre-sci-fi', 'genre-time-paradox'],
          joinedAt: data.user.created_at ?? new Date().toISOString(),
          isDemo: false,
        });
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: String(
            session.user.user_metadata?.full_name ??
              session.user.email?.split('@')[0] ??
              'Reader',
          ),
          email: session.user.email ?? '',
          bio: 'Connected reader account.',
          favoriteGenreIds: ['genre-sci-fi', 'genre-time-paradox'],
          joinedAt: session.user.created_at ?? new Date().toISOString(),
          isDemo: false,
        });
      } else if (isSupabaseConfigured()) {
        setUser(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await signInWithEmail(email, password);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerWithEmail(name, email, password);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const signInWithGoogle = async () => {
    const res = await signInWithGoogleOAuth();
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const requestPasswordReset = async (email: string) => {
    return sendPasswordReset(email);
  };

  const logout = async () => {
    await signOutAccount();
    setUser(null);
  };

  const toggleFavoriteGenre = (genreId: string) => {
    setUser((prev) => {
      const target: DemoUser = prev ?? {
        id: 'demo-guest-reader',
        name: 'Guest Reader (Demo)',
        email: 'guest@demo.local',
        bio: 'Local browser preview profile.',
        favoriteGenreIds: [],
        joinedAt: new Date().toISOString(),
        isDemo: true,
      };
      const exists = target.favoriteGenreIds.includes(genreId);
      const updated: DemoUser = {
        ...target,
        favoriteGenreIds: exists
          ? target.favoriteGenreIds.filter((id) => id !== genreId)
          : [...target.favoriteGenreIds, genreId],
      };
      if (updated.isDemo) {
        saveDemoUser(updated);
      }
      return updated;
    });
  };

  const updateProfileBio = (name: string, bio: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: DemoUser = {
        ...prev,
        name: name.trim() || prev.name,
        bio: bio.trim() || prev.bio,
      };
      if (updated.isDemo) {
        saveDemoUser(updated);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSupabaseReady,
        isLoading,
        signIn,
        register,
        signInWithGoogle,
        requestPasswordReset,
        logout,
        toggleFavoriteGenre,
        updateProfileBio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return ctx;
}
