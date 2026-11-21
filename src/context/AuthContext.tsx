"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Profile } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; user?: User | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const supabase = createClient();

  useEffect(() => {
    if (!configured && typeof window !== "undefined") {
      const saved = localStorage.getItem("taskvault_demo_display_name");
      if (saved) {
        setProfile({
          id: "demo",
          email: "demo@taskvault.local",
          display_name: saved,
          avatar_url: null,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }, [configured]);

  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch {
      // Ignore profile fetch failure
    }
  }, [supabase]);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Failed to get session", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, supabase, fetchProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!configured) {
      return { error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local") };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (!configured) {
      return { error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local") };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split("@")[0],
        },
      },
    });
    return { error, user: data?.user };
  };

  const signInWithGoogle = async () => {
    if (!configured) {
      return { error: new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local") };
    }
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (!configured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!configured) {
      return { error: new Error("Supabase is not configured. Please add your credentials to .env.local") };
    }
    const redirectUrl = `${window.location.origin}/auth/callback?next=/settings`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (displayName: string) => {
    if (!configured) {
      if (typeof window !== "undefined") {
        localStorage.setItem("taskvault_demo_display_name", displayName);
      }
      setProfile({
        id: "demo",
        email: "demo@taskvault.local",
        display_name: displayName,
        avatar_url: null,
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { error: null };
    }

    if (!user) {
      return { error: new Error("No active user session") };
    }

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });
      if (authError) return { error: authError };

      await (supabase.from("profiles") as any)
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      await fetchProfile(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
