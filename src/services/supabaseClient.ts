import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function resolveSupabaseUrl(
  explicitUrl?: string,
  projectId?: string,
): string {
  const cleanUrl = (explicitUrl?.trim() ?? '')
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '');
  if (cleanUrl) {
    return cleanUrl;
  }
  const cleanId = projectId?.trim() ?? '';
  if (cleanId) {
    return `https://${cleanId}.supabase.co`;
  }
  return '';
}

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = resolveSupabaseUrl(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PROJECT_ID,
);
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return cachedClient;
}
