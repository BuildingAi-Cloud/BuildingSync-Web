"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Wordmark } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inline password-reset flow
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "email_not_confirmed") {
        setError("Check your inbox to confirm this email before signing in.");
      } else {
        setError(error.message);
      }
      return;
    }
    router.push("/?go=1");
    router.refresh();
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
      return;
    }
    setResetMessage(`Check ${resetEmail} for a password reset link. It expires in 1 hour.`);
  }

  function startReset() {
    setShowReset(true);
    setResetEmail(email);
    setResetError(null);
    setResetMessage(null);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        <Link href="/" className="block text-center" aria-label="BuildingSync home">
          <Wordmark className="text-2xl" />
        </Link>

        <div className="bg-card border border-border rounded-xl p-7 sm:p-8 shadow-sm">
          <AnimatePresence mode="wait" initial={false}>
            {!showReset ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Sign in
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Welcome back to BuildingSync.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-foreground">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={startReset}
                        className="text-sm text-accent hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full bg-background border border-border rounded-md px-3 py-2.5 pr-14 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-accent hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Reset password
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We&apos;ll email you a one-time link to set a new password.
                </p>

                <form onSubmit={onReset} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors"
                    />
                  </div>

                  {resetError && (
                    <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                      {resetError}
                    </div>
                  )}
                  {resetMessage && (
                    <div role="status" className="rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
                      {resetMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Back to sign in
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || !resetEmail}
                      className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? "Sending…" : "Send reset link"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </main>
  );
}
