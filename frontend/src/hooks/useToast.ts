"use client";

import { useCallback, useState } from "react";
import type { ToastKind, ToastMessage } from "@/components/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const show = useCallback((kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}
