export type ActiveTabPreviewProps = {
  title: string | null;
  url: string | null;
};

export function ActiveTabPreview({ title, url }: ActiveTabPreviewProps) {
  return (
    <section className="bg-white rounded-md border border-gray-200 p-3 space-y-1">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        現在のタブ
      </div>
      <div className="text-sm font-medium truncate" title={title ?? undefined}>
        {title ?? "読み込み中..."}
      </div>
      <div className="text-xs text-gray-500 truncate" title={url ?? undefined}>
        {url ?? ""}
      </div>
    </section>
  );
}
