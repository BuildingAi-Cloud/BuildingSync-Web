"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { AuthShell } from "@/components/AuthShell";

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

type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Account" },
  { n: 2, label: "About you" },
  { n: 3, label: "Verify" },
];

export default function SignUpPage() {
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  // Honeypot field — bots typically fill it; humans never see it.
  const [companyHoneypot, setCompanyHoneypot] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const canStepOneNext = email.trim().length > 0 && strength.score >= 1;
  const canStepTwoNext = name.trim().length > 0;
  const canSubmit = isHuman && agreedTerms && companyHoneypot === "";

  function next() {
    if (step === 1 && canStepOneNext) setStep(2);
    else if (step === 2 && canStepTwoNext) setStep(3);
  }
  function back() {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name, phone: phone || null },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <AuthShell
      back={{ href: "/", label: "Home" }}
      rightSlot={
        <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sign in
        </Link>
      }
    >
      <div>
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          {!done && <Stepper current={step} />}

          <AnimatePresence mode="wait">
            {done ? (
              <DoneView key="done" email={email} onReset={() => { setDone(false); setStep(1); }} />
            ) : (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                  {step === 1 && (
                    <StepAccount
                      email={email} setEmail={setEmail}
                      password={password} setPassword={setPassword}
                      showPassword={showPassword} setShowPassword={setShowPassword}
                      strength={strength}
                    />
                  )}
                  {step === 2 && (
                    <StepProfile
                      name={name} setName={setName}
                      phone={phone} setPhone={setPhone}
                    />
                  )}
                  {step === 3 && (
                    <StepVerify
                      isHuman={isHuman} setIsHuman={setIsHuman}
                      agreedTerms={agreedTerms} setAgreedTerms={setAgreedTerms}
                      companyHoneypot={companyHoneypot} setCompanyHoneypot={setCompanyHoneypot}
                      email={email}
                    />
                  )}

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

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={back}
                      disabled={step === 1}
                      className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      ← Back
                    </button>
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={next}
                        disabled={(step === 1 && !canStepOneNext) || (step === 2 && !canStepTwoNext)}
                        className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? "Creating…" : "Create account"}
                      </button>
                    )}
                  </div>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-accent hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-2">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </AuthShell>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Sign-up progress">
      {STEPS.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <li key={s.n} className="flex-1 flex items-center gap-2">
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors ${
                done
                  ? "bg-accent border-accent text-accent-foreground"
                  : active
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground bg-card"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : s.n}
            </div>
            <span
              className={`hidden sm:inline text-xs font-medium ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${current > s.n ? "bg-accent" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

const inputClass =
  "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors";

function StepAccount(props: {
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  strength: { score: number; label: string };
}) {
  const { email, setEmail, password, setPassword, showPassword, setShowPassword, strength } = props;
  return (
    <>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
      <p className="text-sm text-muted-foreground -mt-1">Start with the Essential plan — $2.50 / unit / month.</p>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <input
          id="email" type="email" autoComplete="email" required placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
        <div className="relative">
          <input
            id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8}
            placeholder="At least 8 characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-14`}
          />
          <button
            type="button" onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
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
            <p className="text-xs text-muted-foreground">{strength.label && `Strength: ${strength.label}`}</p>
          </motion.div>
        )}
      </div>
    </>
  );
}

function StepProfile(props: {
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
}) {
  const { name, setName, phone, setPhone } = props;
  return (
    <>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Tell us about you</h1>
      <p className="text-sm text-muted-foreground -mt-1">This shows up on the requests and announcements you create.</p>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
        <input
          id="name" type="text" required maxLength={100} placeholder="Pat Doe"
          value={name} onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
          Phone <span className="text-muted-foreground/85 font-normal">(optional)</span>
        </label>
        <input
          id="phone" type="tel" maxLength={40} placeholder="+1 555 555 5555"
          value={phone} onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>
    </>
  );
}

function StepVerify(props: {
  isHuman: boolean; setIsHuman: (v: boolean) => void;
  agreedTerms: boolean; setAgreedTerms: (v: boolean) => void;
  companyHoneypot: string; setCompanyHoneypot: (v: string) => void;
  email: string;
}) {
  const { isHuman, setIsHuman, agreedTerms, setAgreedTerms, companyHoneypot, setCompanyHoneypot, email } = props;
  return (
    <>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Quick check</h1>
      <p className="text-sm text-muted-foreground -mt-1">
        We&apos;ll send a confirmation link to <span className="text-foreground font-medium">{email}</span> after this.
      </p>

      {/* Honeypot — hidden from real users via aria + position; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-2500 top-auto w-px h-px overflow-hidden">
        <label>
          Company website (leave blank)
          <input
            type="text" name="company_website" tabIndex={-1} autoComplete="off"
            value={companyHoneypot} onChange={(e) => setCompanyHoneypot(e.target.value)}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 p-4 rounded-md border border-border bg-background/40 cursor-pointer hover:border-accent/50 transition-colors">
        <input
          type="checkbox" checked={isHuman} onChange={(e) => setIsHuman(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-accent cursor-pointer"
        />
        <span className="text-sm text-foreground leading-relaxed">
          <span className="font-medium">I am human.</span>{" "}
          <span className="text-muted-foreground">Tick to confirm you&apos;re a real person creating this account yourself.</span>
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-accent cursor-pointer"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </span>
      </label>
    </>
  );
}

function DoneView({ email, onReset }: { email: string; onReset: () => void }) {
  return (
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
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.<br />
        Open it to confirm and finish onboarding.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        No email after a few minutes? Check spam, or{" "}
        <button type="button" onClick={onReset} className="text-accent hover:underline">
          try a different address
        </button>
        .
      </p>
    </motion.div>
  );
}
