"use client";

import { useEffect, useMemo, useState } from "react";
import { loadSavedLog, type SavedArticleLog } from "@/lib/storage";
import { useSettings } from "@/hooks/useSettings";
import { NotionCard, RecentSavedList, SlackCard } from "@/components/settings";
import { SetupGuide } from "@/components/SetupGuide";
import {
  errorMessage,
  validateNotionApiKey,
  validateNotionId,
  validateReminderDays,
  validateSlackBotToken,
  validateSlackTarget,
} from "@/lib/validators";
import type { SettingsKey } from "@/hooks/useSettings";

const NOTION_DIRTY_KEYS: ReadonlyArray<SettingsKey> = [
  "notionApiKey",
  "notionMode",
  "notionParentPageId",
  "notionDatabaseId",
];

const SLACK_DIRTY_KEYS: ReadonlyArray<SettingsKey> = [
  "slackBotToken",
  "slackTarget",
  "reminderDays",
];

export default function OptionsPage() {
  const { settings, update, isDirty, persist } = useSettings();
  const [saved, setSaved] = useState<SavedArticleLog[]>([]);

  useEffect(() => {
    (async () => {
      setSaved(await loadSavedLog());
    })();
  }, []);

  const v = useMemo(
    () => ({
      apiKey: validateNotionApiKey(settings.notionApiKey),
      parentPageId: validateNotionId(
        settings.notionParentPageId,
        "保存先ページ ID",
      ),
      databaseId: validateNotionId(settings.notionDatabaseId, "Notion DB ID"),
      slackToken: validateSlackBotToken(settings.slackBotToken),
      slackTarget: validateSlackTarget(settings.slackTarget),
      reminderDays: validateReminderDays(settings.reminderDays),
    }),
    [settings],
  );

  const notionDirty = isDirty(NOTION_DIRTY_KEYS);
  const notion = useMemo(() => {
    if (!v.apiKey.ok) return invalid(v.apiKey.message);
    if (settings.notionApiKey.trim() === "")
      return invalid("Notion API キーが必要です");
    if (settings.notionMode === "auto") {
      if (!v.parentPageId.ok) return invalid(v.parentPageId.message);
      if (!v.databaseId.ok) return invalid(v.databaseId.message);
      const hasParent = settings.notionParentPageId.trim() !== "";
      const hasCached = settings.notionDatabaseId.trim() !== "";
      if (!hasParent && !hasCached)
        return invalid("保存先ページ ID を入力してください");
    } else {
      if (!v.databaseId.ok) return invalid(v.databaseId.message);
      if (settings.notionDatabaseId.trim() === "")
        return invalid("Notion DB ID を入力してください");
    }
    if (!notionDirty) return invalid("変更がありません");
    return { canSave: true, disabledHint: undefined };
  }, [settings, v, notionDirty]);

  const slackDirty = isDirty(SLACK_DIRTY_KEYS);
  const slack = useMemo(() => {
    if (!v.slackToken.ok) return invalid(v.slackToken.message);
    if (!v.slackTarget.ok) return invalid(v.slackTarget.message);
    if (!v.reminderDays.ok) return invalid(v.reminderDays.message);
    const tokenFilled = settings.slackBotToken.trim() !== "";
    const targetFilled = settings.slackTarget.trim() !== "";
    if (tokenFilled !== targetFilled) {
      return invalid(
        "Slack Bot Token と通知先は両方入力するか、両方空のままにしてください",
      );
    }
    if (!slackDirty) return invalid("変更がありません");
    return { canSave: true, disabledHint: undefined };
  }, [settings, v, slackDirty]);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Tech Blog Saver 設定</h1>
        <p className="text-sm text-gray-600">
          ユーザーごとに変わる値を設定します。
          入力した値は <code>chrome.storage.local</code> に保存されます。
        </p>
      </header>

      <NotionCard
        settings={settings}
        update={update}
        errors={{
          apiKey: errorMessage(v.apiKey),
          parentPageId: errorMessage(v.parentPageId),
          databaseId: errorMessage(v.databaseId),
        }}
        canSave={notion.canSave}
        disabledHint={notion.disabledHint}
        onSave={persist}
      />
      <SlackCard
        settings={settings}
        update={update}
        errors={{
          slackToken: errorMessage(v.slackToken),
          slackTarget: errorMessage(v.slackTarget),
          reminderDays: errorMessage(v.reminderDays),
        }}
        canSave={slack.canSave}
        disabledHint={slack.disabledHint}
        onSave={persist}
      />

      <SetupGuide />

      <RecentSavedList items={saved} />
    </main>
  );
}

function invalid(message: string) {
  return { canSave: false as const, disabledHint: message };
}
