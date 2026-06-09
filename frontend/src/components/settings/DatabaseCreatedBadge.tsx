export type DatabaseCreatedBadgeProps = {
  databaseId: string;
  onReset: () => void;
};

/**
 * 「DB は作成済み (自動)」のグリーンインジケータ。 ID を表示し、 リセットボタンを併設。
 */
export function DatabaseCreatedBadge({
  databaseId,
  onReset,
}: DatabaseCreatedBadgeProps) {
  return (
    <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-3 py-2 flex items-start gap-2">
      <span aria-hidden>✓</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium">DB は作成済み (自動)</div>
        <div className="font-mono text-[11px] truncate" title={databaseId}>
          {databaseId}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-emerald-800 underline mt-1 hover:opacity-70"
        >
          リセット (別ページに作り直す場合)
        </button>
      </div>
    </div>
  );
}
