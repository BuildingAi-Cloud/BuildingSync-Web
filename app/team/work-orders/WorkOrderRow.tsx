"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Props = {
  workOrder: {
    id: string;
    title: string;
    description: string;
    status: "open" | "assigned" | "in_progress" | "closed";
    createdAt: string;
    openedByLabel: string;
    unitLabel: string | null;
    assignedToLabel: string | null;
  };
  canAct: boolean;
};

const NEXT_STATUS: Record<Props["workOrder"]["status"], Props["workOrder"]["status"] | null> = {
  open: "assigned",
  assigned: "in_progress",
  in_progress: "closed",
  closed: null,
};

const NEXT_LABEL: Record<string, string> = {
  open: "Assign to me",
  assigned: "Start work",
  in_progress: "Mark closed",
};

const STATUS_TONE: Record<string, string> = {
  open: "bg-accent/10 text-accent border-accent/30",
  assigned: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-foreground/5 text-foreground border-border",
  closed: "bg-muted/50 text-muted-foreground border-border line-through",
};

export function WorkOrderRow({ workOrder, canAct }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const next = NEXT_STATUS[workOrder.status];
  const showAction = canAct && next;
  const isLong = workOrder.description.length > 180;

  async function advance() {
    if (!next) return;
    setError(null);
    const res = await fetch(`/api/work-orders/${workOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, assignSelf: workOrder.status === "open" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to update.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-md p-4"
    >
      <div className="flex items-start gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{workOrder.title}</span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${STATUS_TONE[workOrder.status]}`}>
              {workOrder.status.replace("_", " ")}
            </span>
            {workOrder.unitLabel && (
              <span className="text-xs text-muted-foreground">Unit {workOrder.unitLabel}</span>
            )}
          </div>
          <p
            className={`mt-2 text-sm text-muted-foreground whitespace-pre-wrap ${
              !expanded && isLong ? "line-clamp-3" : ""
            }`}
          >
            {workOrder.description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-accent hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground/70">
            Opened {new Date(workOrder.createdAt).toLocaleString()} by {workOrder.openedByLabel}
            {workOrder.assignedToLabel ? ` · Assigned to ${workOrder.assignedToLabel}` : ""}
          </p>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </div>
        {showAction && (
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            className="w-full sm:w-auto text-sm px-4 py-2 rounded-md font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-60 shrink-0"
          >
            {pending ? "…" : NEXT_LABEL[workOrder.status]}
          </button>
        )}
      </div>
    </motion.li>
  );
}
