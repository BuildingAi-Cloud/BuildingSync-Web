"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const inputClass =
  "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors";

export function MaintenanceForm({ hasBuilding }: { hasBuilding: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!hasBuilding) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        You can submit a request once a Building Manager assigns you to a building.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const res = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message || body.error || "Could not submit request.");
      return;
    }
    setTitle("");
    setDescription("");
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-foreground mb-1.5">Title</span>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Leaky faucet in kitchen"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-foreground mb-1.5">Description</span>
        <textarea
          required
          rows={4}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Started yesterday. Constant drip, water pooling under sink."
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          {description.length}/2000
        </span>
      </label>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent flex items-center gap-2"
          >
            <span aria-hidden="true">✓</span>
            <span>Request submitted. Your building team has been emailed.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={submitting || !title.trim() || !description.trim()}
        className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
