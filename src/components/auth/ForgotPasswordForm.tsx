"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { BookmarkCheck, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await resetPasswordForEmail(email.trim());
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(true);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-xl space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-sm mb-2">
          <BookmarkCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Reset your password
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {successMsg ? (
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            Check your email
          </div>
          <p>
            We have sent password reset instructions to <strong>{email}</strong>. Follow the link in the email to set a new password.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@example.com"
            required
            autoFocus
          />

          <Button
            type="submit"
            className="w-full h-10 font-semibold"
            isLoading={isLoading}
          >
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
