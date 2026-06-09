"use client";

import { useState, type ReactNode } from "react";

export type DisclosureProps = {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * 折りたたみセクション。 ヘッダーをクリックで開閉する。
 * 視覚的なシェブロンを ▶ → ▼ に回転で表現。
 */
export function Disclosure({
  title,
  defaultOpen = false,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        <span className="font-medium text-sm">{title}</span>
        <span
          aria-hidden
          className={`text-xs text-gray-400 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 text-sm">{children}</div>
      )}
    </div>
  );
}
