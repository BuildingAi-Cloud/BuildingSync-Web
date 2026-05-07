"use client";

import { useRef } from "react";
import { useConfirm } from "@/components/ConfirmDialog";

// Form-submitting sign-out button with a confirm dialog. Submitting the
// form (rather than calling supabase.auth.signOut directly) preserves
// the server-side cookie wipe in /auth/signout.
export function SignOutButton({
  className = "",
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm, dialog } = useConfirm();

  return (
    <>
      <form ref={formRef} action="/auth/signout" method="post">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            confirm({
              title: "Sign out?",
              description: "You'll be returned to the sign-in page.",
              confirmLabel: "Sign out",
              destructive: false,
              onConfirm: () => formRef.current?.submit(),
            });
          }}
          className={`${fullWidth ? "w-full" : ""} px-3 py-1.5 rounded-md border border-border hover:bg-muted text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${className}`}
        >
          Sign out
        </button>
      </form>
      {dialog}
    </>
  );
}
