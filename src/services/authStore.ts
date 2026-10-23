// PulseBeat Unified Authentication Service (Supabase + Local fallback)
import { getSupabaseClient } from './supabase';

export interface PulseBeatUser {
  id: string;
  email: string;
  isSupabase: boolean;
  createdAt: string;
}

const LOCAL_USER_KEY = 'pulsebeat_active_user_v1';

export const getStoredUser = (): PulseBeatUser | null => {
  const data = localStorage.getItem(LOCAL_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: PulseBeatUser | null) => {
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
};

export const authService = {
  async init(): Promise<PulseBeatUser | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: PulseBeatUser = {
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            isSupabase: true,
            createdAt: session.user.created_at,
          };
          setStoredUser(user);
          return user;
        }
      } catch (err) {
        console.warn('Supabase auth session fetch error:', err);
      }
    }
    return getStoredUser();
  },

  async signUp(email: string, password: string): Promise<{ user: PulseBeatUser | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        return { user: null, error: error.message };
      }
      if (data.user) {
        const user: PulseBeatUser = {
          id: data.user.id,
          email: data.user.email || email,
          isSupabase: true,
          createdAt: data.user.created_at,
        };
        setStoredUser(user);
        return { user, error: null };
      }
    }

    // Local / Offline mode fallback
    const localUser: PulseBeatUser = {
      id: `usr_${Date.now()}`,
      email,
      isSupabase: false,
      createdAt: new Date().toISOString(),
    };
    setStoredUser(localUser);
    return { user: localUser, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: PulseBeatUser | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { user: null, error: error.message };
      }
      if (data.user) {
        const user: PulseBeatUser = {
          id: data.user.id,
          email: data.user.email || email,
          isSupabase: true,
          createdAt: data.user.created_at,
        };
        setStoredUser(user);
        return { user, error: null };
      }
    }

    // Local / Offline mode fallback
    const localUser: PulseBeatUser = {
      id: `usr_${Date.now()}`,
      email,
      isSupabase: false,
      createdAt: new Date().toISOString(),
    };
    setStoredUser(localUser);
    return { user: localUser, error: null };
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error signing out of Supabase:', err);
      }
    }
    setStoredUser(null);
  },
};
