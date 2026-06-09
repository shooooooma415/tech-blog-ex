import type { ReactNode } from "react";

export type Step = string | { text: ReactNode; code?: string };

export function StepList({ steps }: { steps: ReadonlyArray<Step> }) {
  return (
    <ol className="list-decimal list-outside ml-5 space-y-2">
      {steps.map((step, i) => {
        const obj = typeof step === "string" ? { text: step } : step;
        return (
          <li key={i} className="text-gray-800 leading-relaxed">
            {obj.text}
            {obj.code && (
              <pre className="mt-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-700 overflow-x-auto">
                <code>{obj.code}</code>
              </pre>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function WarnBlock({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-2">
      <span className="font-semibold">注意: </span>
      {children}
    </div>
  );
}
