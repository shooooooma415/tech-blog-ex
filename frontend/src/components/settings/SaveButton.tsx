import type { ReactNode } from "react";

export type SaveButtonProps = {
  canSave: boolean;
  saving: boolean;
  disabledHint?: string;
  enabledTitle?: string;
  children?: ReactNode;
  size?: "md" | "sm";
};

/**
 * 「保存」ボタンとその tooltip / hint をまとめた共通コンポーネント。
 * disabled な <button> はホバー判定が効かないことがあるので <span title> で包む。
 */
export function SaveButton({
  canSave,
  saving,
  disabledHint,
  enabledTitle = "現在の入力を保存します",
  children = "この設定を保存",
  size = "md",
}: SaveButtonProps) {
  const tooltip = !canSave
    ? disabledHint ?? "保存できる変更がありません"
    : enabledTitle;
  const sizeClass =
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";
  return (
    <span title={tooltip} className="inline-flex">
      <button
        type="submit"
        disabled={!canSave || saving}
        aria-disabled={!canSave || saving}
        className={`${sizeClass} rounded-md bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {saving ? "保存中..." : children}
      </button>
    </span>
  );
}
