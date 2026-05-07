"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Small accessible confirm dialog. Renders nothing until `open` is true.
// Trap is intentional but minimal — Tab loops via the buttons because
// they're the only focusable elements inside.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={description ? "confirm-desc" : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] w-[calc(100vw-2rem)] max-w-sm bg-card border border-border rounded-xl shadow-2xl p-6"
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p id="confirm-desc" className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card ${
                  destructive
                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent/50"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  const [pending, setPending] = useState<{
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  function confirm(opts: NonNullable<typeof pending>) {
    setPending(opts);
  }

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title ?? ""}
      description={pending?.description}
      confirmLabel={pending?.confirmLabel}
      destructive={pending?.destructive}
      onConfirm={() => {
        pending?.onConfirm();
        setPending(null);
      }}
      onCancel={() => setPending(null)}
    />
  );

  return { confirm, dialog };
}
