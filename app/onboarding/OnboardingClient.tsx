"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { UserRole } from "@prisma/client";
import { saveProfile, savePassword } from "./actions";

const inputClass =
  "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors";

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (pw.length === 0) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return { score: score as 0 | 1 | 2 | 3 | 4, label: ["", "Weak", "Fair", "Strong", "Excellent"][score] };
}

const STAFF_ROLES: UserRole[] = ["admin", "building_manager", "facility_manager", "concierge"];

type Step = 1 | 2 | 3 | 4;

export function OnboardingClient({
  email, defaultName, defaultPhone, role, hasProfile, hasBuilding, portal,
}: {
  email: string;
  defaultName: string | null;
  defaultPhone: string | null;
  role: UserRole;
  hasProfile: boolean;
  hasBuilding: boolean;
  portal: string;
}) {
  const router = useRouter();
  // Start the user at the first incomplete step.
  const initial: Step = !hasProfile ? 2 : 3;
  const [step, setStep] = useState<Step>(initial);

  const isStaff = STAFF_ROLES.includes(role);
  const totalSteps = 4;

  return (
    <div className="mt-8 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
      <Stepper current={step} total={totalSteps} hasProfile={hasProfile} hasBuilding={hasBuilding} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {step === 1 && <WelcomeStep email={email} onNext={() => setStep(2)} />}
          {step === 2 && (
            <ProfileStep
              defaultName={defaultName}
              defaultPhone={defaultPhone}
              onSaved={() => setStep(3)}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <PasswordStep
              onSaved={() => setStep(4)}
              onSkip={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <DoneStep
              role={role}
              isStaff={isStaff}
              hasBuilding={hasBuilding}
              portal={portal}
              onContinue={() => router.push(portal)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stepper({
  current, total, hasProfile, hasBuilding,
}: {
  current: Step;
  total: number;
  hasProfile: boolean;
  hasBuilding: boolean;
}) {
  const labels = ["Welcome", "Profile", "Password", "Ready"];
  const completed = new Set<number>();
  if (hasProfile) completed.add(2);
  // Password change is opt-in (we can't tell if they set a real one),
  // so we mark it done only when the user explicitly progresses past it.
  for (let i = 1; i < current; i++) completed.add(i as Step);

  return (
    <ol className="flex items-center gap-2" aria-label="Onboarding progress">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const done = completed.has(n);
        const active = current === n;
        return (
          <li key={n} className="flex-1 flex items-center gap-2">
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
              {done ? "✓" : n}
            </div>
            <span className={`hidden sm:inline text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {labels[n - 1]}
            </span>
            {n < total && <div className={`flex-1 h-px ${done ? "bg-accent" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function WelcomeStep({ email, onNext }: { email: string; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Welcome</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          You&apos;re in.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Signed in as <span className="text-foreground font-medium">{email}</span>. Three quick steps and you&apos;re ready to use BuildingSync — should take under a minute.
        </p>
      </div>

      <ul className="text-sm text-muted-foreground space-y-2">
        <li className="flex items-baseline gap-2">
          <span className="text-accent">·</span>
          <span><strong className="text-foreground">Profile.</strong> Tell us how to display your name on requests + announcements.</span>
        </li>
        <li className="flex items-baseline gap-2">
          <span className="text-accent">·</span>
          <span><strong className="text-foreground">Password.</strong> Set a real one if you signed in with a temporary code.</span>
        </li>
        <li className="flex items-baseline gap-2">
          <span className="text-accent">·</span>
          <span><strong className="text-foreground">You&apos;re ready.</strong> We&apos;ll point you at the right portal for your role.</span>
        </li>
      </ul>

      <button
        type="button"
        onClick={onNext}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors"
      >
        Let&apos;s go →
      </button>
    </div>
  );
}

function ProfileStep({
  defaultName, defaultPhone, onSaved, onSkip,
}: {
  defaultName: string | null;
  defaultPhone: string | null;
  onSaved: () => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("phone", phone.trim());
    const res = await saveProfile(fd);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      toast.error("Couldn't save profile", { description: res.error });
      return;
    }
    toast.success("Profile saved");
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Profile</p>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Your details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Shows up on the requests and announcements you create.</p>
      </div>

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

      {error && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Skip for now
        </button>
        <button
          type="submit" disabled={saving || !name.trim()}
          className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save and continue →"}
        </button>
      </div>
    </form>
  );
}

function PasswordStep({ onSaved, onSkip }: { onSaved: () => void; onSkip: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => passwordStrength(password), [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (strength.score < 1) return;
    setError(null);
    setSaving(true);
    const fd = new FormData();
    fd.set("password", password);
    const res = await savePassword(fd);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      toast.error("Couldn't update password", { description: res.error });
      return;
    }
    toast.success("Password updated");
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Password</p>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Set a real password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you signed in with a temporary one from your building team, change it now. Otherwise skip and you can update it later under Account.
        </p>
      </div>

      <div>
        <label htmlFor="np" className="block text-sm font-medium text-foreground mb-1.5">New password</label>
        <div className="relative">
          <input
            id="np" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8}
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
                      ? strength.score >= 3 ? "bg-accent" : "bg-yellow-500"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strength.label && `Strength: ${strength.label}`}</p>
          </motion.div>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Skip
        </button>
        <button
          type="submit" disabled={saving || strength.score < 1}
          className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save and continue →"}
        </button>
      </div>
    </form>
  );
}

function DoneStep({
  role, isStaff, hasBuilding, portal, onContinue,
}: {
  role: UserRole;
  isStaff: boolean;
  hasBuilding: boolean;
  portal: string;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-2xl">
        ✓
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Ready</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">You&apos;re all set</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          You&apos;re signed in as <span className="text-foreground font-medium capitalize">{role.replace("_", " ")}</span>.{" "}
          {!hasBuilding && (
            <>
              {isStaff ? (
                <>Ask your platform admin to assign you to a building so you can start managing it.</>
              ) : (
                <>Once your building manager links your account to a unit you&apos;ll see your building info here.</>
              )}
            </>
          )}
          {hasBuilding && <>Continue to your portal to get started.</>}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
        <button
          type="button" onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Open my portal →
        </button>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
        >
          Read the docs
        </Link>
      </div>
    </div>
  );
}
