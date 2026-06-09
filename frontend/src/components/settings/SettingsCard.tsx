"use client";

import { useCallback, useState, type ReactNode } from "react";
import { RequiredBadge, type RequiredLevel } from "./RequiredBadge";
import { SaveButton } from "./SaveButton";

export type SettingsCardProps = {
  title: ReactNode;
  requiredLevel: RequiredLevel;
  description?: ReactNode;
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
  children: ReactNode;
  saveLabel?: string;
};

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/**
 * 設定セクション 1 つを表す Card 風 <form>。
 *  - ヘッダー (title + 必須/任意 バッジ + description)
 *  - 子要素 (入力フィールド群)
 *  - 保存ボタン (dirty + valid な時だけ有効) + 状態表示
 *
 * `canSave` を false にしている理由 (= disabledHint) を SaveButton の tooltip と
 * ボタン右側の補助テキストの両方に出して、 hover 不能な環境でも理由が伝わるようにする。
 */
export function SettingsCard({
  title,
  requiredLevel,
  description,
  canSave,
  disabledHint,
  onSave,
  children,
  saveLabel,
}: SettingsCardProps) {
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave || state.kind === "saving") return;
      setState({ kind: "saving" });
      try {
        await onSave();
        setState({ kind: "saved" });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "保存に失敗しました",
        });
      }
    },
    [canSave, state.kind, onSave],
  );

  // 入力中 (= 再び保存可能になった) は "保存しました" の表示を消す
  const displayState =
    state.kind === "saved" && canSave ? { kind: "idle" as const } : state;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <RequiredBadge level={requiredLevel} />
        </div>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </header>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center gap-3 pt-1">
        <SaveButton
          canSave={canSave}
          saving={state.kind === "saving"}
          disabledHint={disabledHint}
        >
          {saveLabel}
        </SaveButton>
        {displayState.kind === "saved" && (
          <span className="text-sm text-emerald-600">保存しました</span>
        )}
        {displayState.kind === "error" && (
          <span className="text-sm text-rose-600">{displayState.message}</span>
        )}
        {!canSave && disabledHint && displayState.kind === "idle" && (
          <span className="text-xs text-gray-500">{disabledHint}</span>
        )}
      </div>
    </form>
  );
}
