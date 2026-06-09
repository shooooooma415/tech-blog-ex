"use client";

import { NotionSection } from "./NotionSection";
import { SecuritySection } from "./SecuritySection";
import { SlackSection } from "./SlackSection";

export function SetupGuide() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">セットアップ手順</h2>
      <p className="text-xs text-gray-600">
        初回のみ Notion と Slack 側で 1 回ずつ作業が必要です。
        取得した値はこのページの各フィールドに貼ります。
      </p>
      <div className="space-y-2">
        <NotionSection />
        <SlackSection />
        <SecuritySection />
      </div>
    </section>
  );
}
