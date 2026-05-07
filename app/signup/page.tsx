"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Wordmark } from "@/components/ui";

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (pw.length === 0) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["", "Weak", "Fair", "Strong", "Excellent"][score];
  return { score: score as 0 | 1 | 2 | 3 | 4, label };
}

export default function SignUpPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
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
            {!done ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Create your account
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Start with the Essential plan — $2.50 / unit / month. Cancel anytime.
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
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
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

                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 space-y-1.5"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((tier) => (
                            <div
                              key={tier}
                              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                strength.score >= tier
                                  ? strength.score >= 3
                                    ? "bg-accent"
                                    : "bg-yellow-500"
                                  : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {strength.label && `Strength: ${strength.label}`}
                        </p>
                      </motion.div>
                    )}
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
                    disabled={loading || strength.score < 1}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-accent hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-2xl">
                  ✓
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  No email after a few minutes? Check spam, or{" "}
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="text-accent hover:underline"
                  >
                    try a different address
                  </button>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </main>
  );
}
