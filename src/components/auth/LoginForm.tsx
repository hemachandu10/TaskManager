"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { BookmarkCheck, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, isConfigured } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await signInWithEmail(email.trim(), password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      toast.success("Signed in successfully");
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-xl space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-sm mb-2">
          <BookmarkCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to TaskVault
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Access your saved problems, lessons, and productivity lists.
        </p>
      </div>

      {!isConfigured && (
        <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Supabase Project Pending
          </p>
          <p>
            Add your Supabase URL &amp; Publishable Anon Key to <code>.env.local</code> to activate cloud auth. You can also preview the dashboard in local preview mode.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Continue to Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full h-10 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
        <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-semibold uppercase text-zinc-400">
          or with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="developer@example.com"
          required
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 font-semibold"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
