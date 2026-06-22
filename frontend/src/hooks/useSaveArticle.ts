"use client";

import { useCallback, useState } from "react";
import { saveArticle } from "@/lib/api";
import { copyToClipboard } from "@/lib/activeTab";
import { appendSavedLog } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

type SaveResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type UseSaveArticleResult = {
  saving: boolean;
  save: (input: {
    tab: { url: string; title: string };
    settings: AppSettings;
  }) => Promise<SaveResult & { databaseId?: string; databaseCreated?: boolean }>;
};

/**
 * popup の保存処理 (リンクコピー → backend API → ローカル履歴追記) をまとめた hook。
 *
 * 呼び出し側は結果を受け取って toast 表示 / popup close / databaseId キャッシュを
 * 行う。 hook 側ではそれらの "副作用" には踏み込まない。
 */
export function useSaveArticle(): UseSaveArticleResult {
  const [saving, setSaving] = useState(false);

  const save = useCallback<UseSaveArticleResult["save"]>(
    async ({ tab, settings }) => {
      setSaving(true);
      try {
        const copied = await copyToClipboard(tab.url);
        const isManual = settings.notionMode === "manual";
        const result = await saveArticle({
          url: tab.url,
          title: tab.title,
          notionApiKey: settings.notionApiKey.trim(),
          parentPageId: isManual ? "" : settings.notionParentPageId.trim(),
          databaseId: settings.notionDatabaseId.trim() || undefined,
        });

        if (!result.ok) {
          return { ok: false, error: result.error };
        }

        await appendSavedLog({
          id: result.data.id,
          url: result.data.url,
          title: result.data.title,
          savedAt: result.data.createdAt,
        });

        const message = result.data.databaseCreated
          ? "Notion DB を作成して保存しました"
          : "Notion に保存しました";
        const fullMessage = copied
          ? `${message} (リンクをコピー済み)`
          : message;

        return {
          ok: true,
          message: fullMessage,
          databaseId: result.data.databaseId,
          databaseCreated: result.data.databaseCreated,
        };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, save };
}
