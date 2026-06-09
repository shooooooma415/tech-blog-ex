"use client";

import type { ReactNode } from "react";

export type Tab<V extends string> = {
  value: V;
  label: ReactNode;
  sub?: ReactNode;
};

export type TabsProps<V extends string> = {
  value: V;
  onChange: (next: V) => void;
  tabs: ReadonlyArray<Tab<V>>;
  ariaLabel?: string;
};

/**
 * シンプルな 2 値以上のセグメントタブ。 タイトルとサブテキスト 2 行を表示できる。
 */
export function Tabs<V extends string>({
  value,
  onChange,
  tabs,
  ariaLabel,
}: TabsProps<V>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`text-left rounded-md px-3 py-2 transition-colors ${
              active
                ? "bg-white shadow-sm border border-gray-200"
                : "hover:bg-white/60 border border-transparent"
            }`}
          >
            <div
              className={`text-sm ${
                active ? "font-semibold text-gray-900" : "text-gray-600"
              }`}
            >
              {t.label}
            </div>
            {t.sub && <div className="text-[11px] text-gray-500">{t.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}
