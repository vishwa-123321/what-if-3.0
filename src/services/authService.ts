import { DemoUser } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export interface AuthActionResult {
  user: DemoUser | null;
  message: string;
  isDemo: boolean;
  error?: string;
}

const DEMO_USER_STORAGE_KEY = 'whatif_demo_user_v1';

export function getStoredDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function saveDemoUser(user: DemoUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } else {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage quota errors in restricted frames
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user) {
      return {
        user: null,
        message: '',
        isDemo: false,
        error: error?.message ?? 'Unable to sign in with Supabase Auth.',
      };
    }
    const user: DemoUser = {
      id: data.user.id,
      name:
        String(data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Reader'),
      email: data.user.email ?? email.trim(),
      bio: 'Explorer of branching narratives.',
      favoriteGenreIds: ['genre-sci-fi', 'genre-noir-mystery'],
      joinedAt: data.user.created_at ?? new Date().toISOString(),
      isDemo: false,
    };
    return {
      user,
      message: 'Signed in via Supabase Auth.',
      isDemo: false,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const displayName = normalizedEmail.split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const demoUser: DemoUser = {
    id: `demo-user-${normalizedEmail}`,
    name: displayName || 'Demo Reader',
    email: normalizedEmail,
    bio: 'Demo reader session stored locally in your browser until Supabase Auth is connected.',
    favoriteGenreIds: ['genre-sci-fi', 'genre-time-paradox', 'genre-noir-mystery'],
    joinedAt: new Date().toISOString(),
    isDemo: true,
  };
  saveDemoUser(demoUser);
  return {
    user: demoUser,
    message: 'Signed into local Demo Session (not saved to Supabase yet).',
    isDemo: true,
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });
    if (error || !data.user) {
      return {
        user: null,
        message: '',
        isDemo: false,
        error: error?.message ?? 'Unable to create account with Supabase Auth.',
      };
    }
    const user: DemoUser = {
      id: data.user.id,
      name: name.trim(),
      email: data.user.email ?? email.trim(),
      bio: 'New explorer on WHAT IF 3.0.',
      favoriteGenreIds: ['genre-sci-fi'],
      joinedAt: new Date().toISOString(),
      isDemo: false,
    };
    return {
      user,
      message: 'Account created via Supabase Auth.',
      isDemo: false,
    };
  }

  const demoUser: DemoUser = {
    id: `demo-user-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    bio: 'Demo account created locally in browser storage until Supabase Auth is connected.',
    favoriteGenreIds: ['genre-sci-fi', 'genre-dark-fantasy'],
    joinedAt: new Date().toISOString(),
    isDemo: true,
  };
  saveDemoUser(demoUser);
  return {
    user: demoUser,
    message: 'Demo profile created locally (not persisted to Supabase yet).',
    isDemo: true,
  };
}

export async function sendPasswordReset(
  email: string,
): Promise<{ ok: boolean; isDemo: boolean; message: string; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      return { ok: false, isDemo: false, message: '', error: error.message };
    }
    return {
      ok: true,
      isDemo: false,
      message: `Password reset instructions sent to ${email.trim()}.`,
    };
  }

  return {
    ok: true,
    isDemo: true,
    message: `Demo preview: When Supabase Auth is configured, reset instructions will be sent to ${email.trim()}.`,
  };
}

export async function signInWithGoogleOAuth(): Promise<AuthActionResult> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    if (error) {
      return { user: null, message: '', isDemo: false, error: error.message };
    }
    return {
      user: null,
      message: 'Redirecting to Google sign-in...',
      isDemo: false,
    };
  }

  const demoGoogleUser: DemoUser = {
    id: 'demo-google-reader',
    name: 'Avery Mercer (Demo Google)',
    email: 'avery.demo@example.com',
    bio: 'Demo OAuth preview session. Connect your Supabase Google provider to authenticate real accounts.',
    favoriteGenreIds: ['genre-time-paradox', 'genre-noir-mystery', 'genre-space-opera'],
    joinedAt: new Date().toISOString(),
    isDemo: true,
  };
  saveDemoUser(demoGoogleUser);
  return {
    user: demoGoogleUser,
    message: 'Signed into Demo Google preview session (Supabase OAuth not yet connected).',
    isDemo: true,
  };
}

export async function signOutAccount(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  saveDemoUser(null);
}
