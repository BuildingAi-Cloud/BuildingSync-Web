"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { formatRelative } from "@/lib/format";
import { deleteDocument, getDocumentDownloadUrl } from "./actions";

type Doc = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  visibility: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByLabel: string;
  createdAt: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  bylaws: "Bylaws",
  fire_safety: "Fire safety",
  lease: "Lease",
  vendor: "Vendor",
  insurance: "Insurance",
  maintenance: "Maintenance",
  other: "Other",
};

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsList({ documents, canManage }: { documents: Doc[]; canManage: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function download(doc: Doc) {
    setBusyId(doc.id);
    const res = await getDocumentDownloadUrl(doc.id);
    setBusyId(null);
    if (!res.ok) {
      toast.error("Couldn't open document", { description: res.error });
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  }

  function onDelete(doc: Doc) {
    confirm({
      title: `Remove "${doc.title}"?`,
      description: "Residents and other staff will no longer see this document. The original file is retained for audit purposes.",
      confirmLabel: "Remove",
      destructive: true,
      onConfirm: async () => {
        setBusyId(doc.id);
        const res = await deleteDocument(doc.id);
        setBusyId(null);
        if (!res.ok) {
          toast.error("Couldn't remove", { description: res.error });
          return;
        }
        toast.success("Document removed");
        startTransition(() => router.refresh());
      },
    });
  }

  return (
    <>
      <ul className="space-y-2">
        {documents.map((d) => (
          <motion.li
            key={d.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-md p-4"
          >
            <div className="flex items-start gap-3 flex-wrap">
              <DocIcon mimeType={d.mimeType} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{d.title}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-border text-muted-foreground bg-muted/30">
                    {CATEGORY_LABEL[d.category] ?? d.category}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                      d.visibility === "public"
                        ? "border-accent/40 text-accent bg-accent/10"
                        : "border-border text-muted-foreground bg-muted/30"
                    }`}
                  >
                    {d.visibility === "public" ? "Public" : "Staff only"}
                  </span>
                </div>
                {d.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap">{d.description}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground/85">
                  Uploaded by {d.uploadedByLabel} · {formatRelative(d.createdAt)} · {formatBytes(d.sizeBytes)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => download(d)}
                  disabled={busyId === d.id}
                  className="text-sm px-3 py-1.5 rounded-md border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  {busyId === d.id ? "Opening…" : "Open"}
                </button>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onDelete(d)}
                    disabled={busyId === d.id}
                    className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
      {dialog}
    </>
  );
}

function DocIcon({ mimeType }: { mimeType: string }) {
  const isPdf = mimeType === "application/pdf";
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center border ${
        isPdf
          ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
      }`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </span>
  );
}
