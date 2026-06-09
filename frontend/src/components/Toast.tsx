"use client";

import { useEffect } from "react";

export type ToastKind = "success" | "error";

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  message: string;
};

const STYLE: Record<ToastKind, string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
};

const ICON: Record<ToastKind, string> = {
  success: "✓",
  error: "!",
};

export function Toast({
  toast,
  onDismiss,
  durationMs = 2800,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-50 pointer-events-none"
    >
      <div
        className={`pointer-events-auto rounded-md shadow-lg px-3 py-2 text-sm flex items-start gap-2 animate-[fadeIn_120ms_ease-out] ${STYLE[toast.kind]}`}
      >
        <span
          aria-hidden
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
        >
          {ICON[toast.kind]}
        </span>
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
