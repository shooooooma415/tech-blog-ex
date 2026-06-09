"use client";

import { useCallback, useEffect, useState } from "react";
import { saveArticleMock } from "@/lib/api";
import { copyToClipboard, getActiveTabInfo } from "@/lib/activeTab";
import {
  DEFAULT_SETTINGS,
  appendSavedLog,
  loadSettings,
  saveSettings,
} from "@/lib/storage";
import type { AppSettings } from "@/lib/types";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

if (typeof window !== "undefined") {
  // ハイドレーションが走ったかを確認するための診断ログ
  console.log("[tech-blog-ex] popup module loaded");
}

export default function PopupPage() {
  const [tab, setTab] = useState<{ url: string; title: string } | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    console.log("[tech-blog-ex] popup useEffect fired - hydration OK");
    if (typeof document !== "undefined") {
      document.body.classList.add("popup");
    }
    (async () => {
      const [info, s] = await Promise.all([getActiveTabInfo(), loadSettings()]);
      console.log("[tech-blog-ex] tab info loaded:", info);
      setTab(info);
      setSettings(s);
    })();
  }, []);

  const settingsConfigured =
    settings.notionApiKey.trim() !== "" &&
    (settings.notionMode === "manual"
      ? settings.notionDatabaseId.trim() !== ""
      : settings.notionParentPageId.trim() !== "" ||
        settings.notionDatabaseId.trim() !== "");

  const handleSave = useCallback(async () => {
    if (!tab || saving) return;
    setSaving(true);
    try {
      const copied = await copyToClipboard(tab.url);
      // manual モードでは parentPageId は送らず、 databaseId のみ使う。
      // auto モードでは parentPageId を送り、 キャッシュ済み databaseId があれば併送。
      const isManual = settings.notionMode === "manual";
      const result = await saveArticleMock({
        url: tab.url,
        title: tab.title,
        parentPageId: isManual ? "" : settings.notionParentPageId.trim(),
        databaseId: settings.notionDatabaseId.trim() || undefined,
      });

      if (!result.ok) {
        show("error", result.error);
        return;
      }

      // auto モードで backend が DB を新規作成したときだけ、 ID をキャッシュ。
      // manual モードでは設定値をそのまま使うのでキャッシュ書き込みは不要。
      if (
        !isManual &&
        result.data.databaseCreated &&
        result.data.databaseId &&
        result.data.databaseId !== settings.notionDatabaseId
      ) {
        const next = { ...settings, notionDatabaseId: result.data.databaseId };
        setSettings(next);
        await saveSettings(next);
      }

      await appendSavedLog({
        id: result.data.id,
        url: result.data.url,
        title: result.data.title,
        savedAt: result.data.createdAt,
      });

      const baseMsg = result.data.databaseCreated
        ? "Notion DB を作成して保存しました"
        : "Notion に保存しました";
      show("success", copied ? `${baseMsg} (リンクをコピー済み)` : baseMsg);
      setTimeout(() => {
        if (typeof window !== "undefined") window.close();
      }, 900);
    } finally {
      setSaving(false);
    }
  }, [tab, saving, settings, show]);

  const openOptions = useCallback(async () => {
    console.log("[tech-blog-ex] settings button clicked");
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime?.getURL) {
      try {
        await chrome.tabs.create({
          url: chrome.runtime.getURL("options/index.html"),
        });
        window.close();
        return;
      } catch (e) {
        console.error("[tech-blog-ex] chrome.tabs.create failed:", e);
      }
    }
    if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
      try {
        await chrome.runtime.openOptionsPage();
        return;
      } catch (e) {
        console.error("[tech-blog-ex] openOptionsPage failed:", e);
      }
    }
    if (typeof window !== "undefined") {
      window.open("/options/", "_blank");
    }
  }, []);

  return (
    <main className="p-4 space-y-3 relative">
      <header className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Tech Blog Saver</h1>
        <button
          type="button"
          onClick={openOptions}
          aria-label="設定を開く"
          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
        >
          設定
        </button>
      </header>

      {!settingsConfigured && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-2">
          Notion の API キーと「保存先ページ ID」が未設定です。「設定」から登録してください。
          <br />
          <span className="opacity-70">
            (mock モードのため未設定でも動作確認は可能です)
          </span>
        </div>
      )}

      <section className="bg-white rounded-md border border-gray-200 p-3 space-y-1">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">
          現在のタブ
        </div>
        <div className="text-sm font-medium truncate" title={tab?.title}>
          {tab?.title ?? "読み込み中..."}
        </div>
        <div className="text-xs text-gray-500 truncate" title={tab?.url}>
          {tab?.url ?? ""}
        </div>
      </section>

      <button
        type="button"
        disabled={!tab || saving}
        onClick={handleSave}
        className="w-full px-3 py-2 rounded-md bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "保存中..." : "Notion に保存"}
      </button>

      <p className="text-[10px] text-gray-400 leading-snug">
        backend 未接続のため mock 実装で動作しています。 backend 実装後は{" "}
        <code>src/lib/api.ts</code> を差し替えてください。
      </p>

      <Toast toast={toast} onDismiss={dismiss} />
    </main>
  );
}
