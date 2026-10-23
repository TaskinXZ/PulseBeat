// Supabase Client and Database Service
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_STORAGE_KEYS = {
  URL: 'pulsebeat_supabase_url',
  ANON_KEY: 'pulsebeat_supabase_anon_key',
};

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || '';
  const storedKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url && anonKey && url.startsWith('https://') && url.includes('.supabase.co')
  );

  return { url, anonKey, isConfigured };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url.trim());
  localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, anonKey.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
  localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
};

let cachedClient: SupabaseClient | null = null;
let lastConfigUrl = '';
let lastConfigKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && lastConfigUrl === url && lastConfigKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastConfigUrl = url;
    lastConfigKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};
