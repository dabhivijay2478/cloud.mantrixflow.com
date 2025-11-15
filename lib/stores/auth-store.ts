import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import type { User, AuthError } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string },
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
  forgotPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (password: string) => Promise<{ error: AuthError | null }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  loading: true,
  error: null,
  initialized: false,

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ initialized }),

  signIn: async (email, password) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    set({ user: data.user, loading: false });
    return { error: null };
  },

  signUp: async (email, password, metadata) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata?.firstName,
          last_name: metadata?.lastName,
          full_name:
            metadata?.firstName && metadata?.lastName
              ? `${metadata.firstName} ${metadata.lastName}`
              : undefined,
        },
      },
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    set({ user: data.user, loading: false });
    return { error: null };
  },

  signOut: async () => {
    set({ loading: true, error: null });

    const { error } = await supabase.auth.signOut();

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    set({ user: null, loading: false });
    return { error: null };
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    return { error: null };
  },

  signInWithGitHub: async () => {
    set({ loading: true, error: null });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    return { error: null };
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  resetPassword: async (password) => {
    set({ loading: true, error: null });

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      return { error };
    }

    set({ loading: false });
    return { error: null };
  },

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      loading: false,
      initialized: true,
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null });

      if (event === "SIGNED_OUT") {
        // Clear any additional user data if needed
        set({ user: null });
      }
    });
  },
}));

// Initialize auth on store creation
if (typeof window !== "undefined") {
  useAuthStore.getState().initialize();
}
