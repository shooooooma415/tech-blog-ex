import type { SavedArticleLog } from "@/lib/storage";

export type RecentSavedListProps = {
  items: SavedArticleLog[];
};

export function RecentSavedList({ items }: RecentSavedListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">最近保存した記事 (mock)</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          まだ保存履歴はありません。 popup から「保存」を押してみてください。
        </p>
      ) : (
        <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="p-3 text-sm">
              <div className="font-medium truncate">{item.title}</div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand hover:underline truncate block"
              >
                {item.url}
              </a>
              <div className="text-[11px] text-gray-400">
                {new Date(item.savedAt).toLocaleString("ja-JP")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
