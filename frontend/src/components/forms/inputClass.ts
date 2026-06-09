/**
 * 共通の <input> 系スタイル。 error 状態だけ赤系に切り替える。
 * 追加 class (`font-mono`, `w-32` 等) は `extra` に渡す。
 */
export function inputClass(extra: string = "", hasError: boolean = false): string {
  const base =
    "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const colors = hasError
    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
    : "border-gray-300 focus:ring-brand/30";
  return [base, colors, extra].filter(Boolean).join(" ");
}
