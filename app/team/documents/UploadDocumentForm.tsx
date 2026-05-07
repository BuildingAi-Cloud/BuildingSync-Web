"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { uploadDocument } from "./actions";

const inputClass =
  "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors";

const CATEGORIES = [
  { value: "bylaws", label: "Bylaws & rules" },
  { value: "fire_safety", label: "Fire safety" },
  { value: "lease", label: "Lease & forms" },
  { value: "vendor", label: "Vendor contracts" },
  { value: "insurance", label: "Insurance" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

type Result =
  | { ok: true; documentId: string }
  | { ok: false; error: string }
  | null;

export function UploadDocumentForm() {
  const [state, formAction, pending] = useActionState<Result, FormData>(uploadDocument, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Document uploaded");
      formRef.current?.reset();
    }
    if (state && !state.ok) toast.error("Upload failed", { description: state.error });
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-foreground mb-1.5">Title</span>
        <input name="title" required maxLength={200} placeholder="2026 Building Bylaws" className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-foreground mb-1.5">
          Description <span className="text-muted-foreground/80 font-normal">(optional)</span>
        </span>
        <textarea name="description" rows={2} maxLength={2000} placeholder="What's in this document — anything residents/team should know before opening it." className={inputClass} />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-sm font-medium text-foreground mb-1.5">Category</span>
          <select name="category" defaultValue="other" required className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-foreground mb-1.5">Visibility</span>
          <select name="visibility" defaultValue="staff_only" required className={inputClass}>
            <option value="staff_only">Staff only</option>
            <option value="public">Public — residents can see</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="block text-sm font-medium text-foreground mb-1.5">File</span>
        <input
          type="file"
          name="file"
          required
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border file:border-border file:bg-card file:hover:bg-muted file:transition-colors file:cursor-pointer file:text-foreground"
        />
        <span className="mt-1 block text-xs text-muted-foreground">PDF, PNG, JPEG, or WebP. 10 MB max.</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Uploading…" : "Upload document"}
      </button>

      <AnimatePresence mode="wait">
        {state && !state.ok && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
