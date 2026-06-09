"use client";

import { useCallback, useEffect } from "react";
import { Toast } from "@/components/Toast";
import {
  ActiveTabPreview,
  NotConfiguredBanner,
  PopupHeader,
  SaveArticleButton,
} from "@/components/popup";
import { useActiveTab } from "@/hooks/useActiveTab";
import { useSaveArticle } from "@/hooks/useSaveArticle";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { openOptionsPage } from "@/lib/openOptionsPage";

const AUTO_CLOSE_DELAY_MS = 900;

export default function PopupPage() {
  const tab = useActiveTab();
  const { settings, setSettings } = useSettings();
  const { saving, save } = useSaveArticle();
  const { toast, show, dismiss } = useToast();

  // popup には body 固定サイズの class を当てる
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.add("popup");
    }
  }, []);

  const configured = isConfigured(settings);

  const handleSave = useCallback(async () => {
    if (!tab) return;
    const result = await save({ tab, settings });
    if (!result.ok) {
      show("error", result.error);
      return;
    }
    // auto モードで backend が新規 DB を作ったら ID をキャッシュ
    if (
      settings.notionMode !== "manual" &&
      result.databaseCreated &&
      result.databaseId &&
      result.databaseId !== settings.notionDatabaseId
    ) {
      setSettings({ ...settings, notionDatabaseId: result.databaseId });
    }
    show("success", result.message);
    setTimeout(() => {
      if (typeof window !== "undefined") window.close();
    }, AUTO_CLOSE_DELAY_MS);
  }, [tab, settings, save, show, setSettings]);

  return (
    <main className="p-4 space-y-3 relative">
      <PopupHeader onOpenOptions={openOptionsPage} />
      {!configured && <NotConfiguredBanner />}
      <ActiveTabPreview title={tab?.title ?? null} url={tab?.url ?? null} />
      <SaveArticleButton
        disabled={!tab}
        saving={saving}
        onClick={handleSave}
      />
      <p className="text-[10px] text-gray-400 leading-snug">
        backend 未接続のため mock 実装で動作しています。 backend 実装後は{" "}
        <code>src/lib/api.ts</code> を差し替えてください。
      </p>
      <Toast toast={toast} onDismiss={dismiss} />
    </main>
  );
}

function isConfigured(s: ReturnType<typeof useSettings>["settings"]): boolean {
  if (s.notionApiKey.trim() === "") return false;
  if (s.notionMode === "manual") return s.notionDatabaseId.trim() !== "";
  return s.notionParentPageId.trim() !== "" || s.notionDatabaseId.trim() !== "";
}
