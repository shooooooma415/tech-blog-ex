import { Tabs, type Tab } from "@/components/forms";
import type { NotionMode } from "@/lib/types";

const TABS: ReadonlyArray<Tab<NotionMode>> = [
  {
    value: "auto",
    label: "新しい DB を作成 (推奨)",
    sub: "ページ ID から自動生成",
  },
  {
    value: "manual",
    label: "既存の DB を使う",
    sub: "DB ID を直接指定",
  },
];

export function NotionModeTabs({
  value,
  onChange,
}: {
  value: NotionMode;
  onChange: (next: NotionMode) => void;
}) {
  return (
    <Tabs<NotionMode>
      value={value}
      onChange={onChange}
      tabs={TABS}
      ariaLabel="Notion 保存先の指定方法"
    />
  );
}
