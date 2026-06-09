"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  loadSavedLog,
  loadSettings,
  saveSettings,
  type SavedArticleLog,
} from "@/lib/storage";
import type { AppSettings, NotionMode } from "@/lib/types";
import { SetupGuide } from "@/components/SetupGuide";
import {
  errorMessage,
  validateNotionApiKey,
  validateNotionId,
  validateReminderDays,
  validateSlackBotToken,
  validateSlackTarget,
} from "@/lib/validators";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export default function OptionsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState<SavedArticleLog[]>([]);

  useEffect(() => {
    (async () => {
      const [s, log] = await Promise.all([loadSettings(), loadSavedLog()]);
      setSettings(s);
      setSavedSettings(s);
      setSaved(log);
    })();
  }, []);

  const update = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const persist = useCallback(async () => {
    await saveSettings(settings);
    setSavedSettings(settings);
  }, [settings]);

  // --- 各フィールドのバリデーション ---
  const v = useMemo(
    () => ({
      apiKey: validateNotionApiKey(settings.notionApiKey),
      parentPageId: validateNotionId(settings.notionParentPageId, "保存先ページ ID"),
      databaseId: validateNotionId(settings.notionDatabaseId, "Notion DB ID"),
      slackToken: validateSlackBotToken(settings.slackBotToken),
      slackTarget: validateSlackTarget(settings.slackTarget),
      reminderDays: validateReminderDays(settings.reminderDays),
    }),
    [settings],
  );

  // --- Notion カード ---
  const notionDirty = useMemo(
    () =>
      settings.notionApiKey !== savedSettings.notionApiKey ||
      settings.notionMode !== savedSettings.notionMode ||
      settings.notionParentPageId !== savedSettings.notionParentPageId ||
      settings.notionDatabaseId !== savedSettings.notionDatabaseId,
    [settings, savedSettings],
  );

  const { notionCanSave, notionDisabledHint } = useMemo(() => {
    if (!v.apiKey.ok) return invalidResult(v.apiKey.message);
    if (settings.notionApiKey.trim() === "") {
      return invalidResult("Notion API キーが必要です");
    }
    if (settings.notionMode === "auto") {
      if (!v.parentPageId.ok) return invalidResult(v.parentPageId.message);
      if (!v.databaseId.ok) return invalidResult(v.databaseId.message);
      const hasParent = settings.notionParentPageId.trim() !== "";
      const hasCached = settings.notionDatabaseId.trim() !== "";
      if (!hasParent && !hasCached) {
        return invalidResult("保存先ページ ID を入力してください");
      }
    } else {
      if (!v.databaseId.ok) return invalidResult(v.databaseId.message);
      if (settings.notionDatabaseId.trim() === "") {
        return invalidResult("Notion DB ID を入力してください");
      }
    }
    if (!notionDirty) return { notionCanSave: false, notionDisabledHint: "変更がありません" };
    return { notionCanSave: true, notionDisabledHint: undefined };
  }, [settings, v, notionDirty]);

  // --- Slack カード ---
  const slackDirty = useMemo(
    () =>
      settings.slackBotToken !== savedSettings.slackBotToken ||
      settings.slackTarget !== savedSettings.slackTarget ||
      settings.reminderDays !== savedSettings.reminderDays,
    [settings, savedSettings],
  );

  const { slackCanSave, slackDisabledHint } = useMemo(() => {
    if (!v.slackToken.ok) return invalidResultSlack(v.slackToken.message);
    if (!v.slackTarget.ok) return invalidResultSlack(v.slackTarget.message);
    if (!v.reminderDays.ok) return invalidResultSlack(v.reminderDays.message);
    const tokenFilled = settings.slackBotToken.trim() !== "";
    const targetFilled = settings.slackTarget.trim() !== "";
    if (tokenFilled !== targetFilled) {
      return invalidResultSlack(
        "Slack Bot Token と通知先は両方入力するか、両方空のままにしてください",
      );
    }
    if (!slackDirty) return { slackCanSave: false, slackDisabledHint: "変更がありません" };
    return { slackCanSave: true, slackDisabledHint: undefined };
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
        canSave={notionCanSave}
        disabledHint={notionDisabledHint}
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
        canSave={slackCanSave}
        disabledHint={slackDisabledHint}
        onSave={persist}
      />

      <SetupGuide />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">最近保存した記事 (mock)</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ保存履歴はありません。 popup から「保存」を押してみてください。
          </p>
        ) : (
          <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {saved.map((item) => (
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
    </main>
  );
}

function invalidResult(message: string) {
  return { notionCanSave: false as const, notionDisabledHint: message };
}
function invalidResultSlack(message: string) {
  return { slackCanSave: false as const, slackDisabledHint: message };
}

type NotionErrors = {
  apiKey?: string;
  parentPageId?: string;
  databaseId?: string;
};

type SlackErrors = {
  slackToken?: string;
  slackTarget?: string;
  reminderDays?: string;
};

function NotionCard({
  settings,
  update,
  errors,
  canSave,
  disabledHint,
  onSave,
}: {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  errors: NotionErrors;
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
}) {
  return (
    <SettingsCard
      title="Notion"
      requiredLabel="必須"
      description="記事を保存するための接続情報。"
      canSave={canSave}
      disabledHint={disabledHint}
      onSave={onSave}
    >
      <Field
        label="Notion API キー"
        description="Internal Integration Secret (secret_xxxx)。 取得方法は下のセットアップ手順を参照"
        error={errors.apiKey}
      >
        <input
          type="password"
          value={settings.notionApiKey}
          onChange={(e) => update("notionApiKey", e.target.value)}
          placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className={inputClass("font-mono", !!errors.apiKey)}
          aria-invalid={!!errors.apiKey}
          autoComplete="off"
        />
      </Field>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">保存先の指定方法</div>
        <ModeTabs
          value={settings.notionMode}
          onChange={(m) => update("notionMode", m)}
        />
      </div>

      {settings.notionMode === "auto" ? (
        <>
          <Field
            label="保存先ページ ID"
            description="空のページを作って integration を招待し、 その URL 末尾の 32桁を貼る。 初回保存時に backend がこのページ配下に DB を自動作成"
            error={errors.parentPageId}
          >
            <input
              type="text"
              value={settings.notionParentPageId}
              onChange={(e) => update("notionParentPageId", e.target.value)}
              placeholder="32桁のページID"
              className={inputClass("font-mono", !!errors.parentPageId)}
              aria-invalid={!!errors.parentPageId}
              autoComplete="off"
            />
          </Field>
          {settings.notionDatabaseId && (
            <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-3 py-2 flex items-start gap-2">
              <span aria-hidden>✓</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">DB は作成済み (自動)</div>
                <div
                  className="font-mono text-[11px] truncate"
                  title={settings.notionDatabaseId}
                >
                  {settings.notionDatabaseId}
                </div>
                <button
                  type="button"
                  onClick={() => update("notionDatabaseId", "")}
                  className="text-[11px] text-emerald-800 underline mt-1 hover:opacity-70"
                >
                  リセット (別ページに作り直す場合)
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Field
            label="Notion DB ID"
            description="DB URL の最後のセグメント (32桁)。 DB には Name (Title) / URL (URL) / 読了 (Checkbox) / Created (Created time) プロパティが必要"
            error={errors.databaseId}
          >
            <input
              type="text"
              value={settings.notionDatabaseId}
              onChange={(e) => update("notionDatabaseId", e.target.value)}
              placeholder="32桁のデータベースID"
              className={inputClass("font-mono", !!errors.databaseId)}
              aria-invalid={!!errors.databaseId}
              autoComplete="off"
            />
          </Field>
          <p className="text-[11px] text-gray-500">
            既存の DB を直接指定するモードです。 backend は DB を新規作成しません。
            プロパティ名/型が一致していないと保存時にエラーになります。
          </p>
        </>
      )}
    </SettingsCard>
  );
}

function ModeTabs({
  value,
  onChange,
}: {
  value: NotionMode;
  onChange: (v: NotionMode) => void;
}) {
  const tabs: Array<{ value: NotionMode; label: string; sub: string }> = [
    { value: "auto", label: "新しい DB を作成 (推奨)", sub: "ページ ID から自動生成" },
    { value: "manual", label: "既存の DB を使う", sub: "DB ID を直接指定" },
  ];
  return (
    <div
      role="tablist"
      className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1"
    >
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`text-left rounded-md px-3 py-2 transition-colors ${
              active
                ? "bg-white shadow-sm border border-gray-200"
                : "hover:bg-white/60 border border-transparent"
            }`}
          >
            <div
              className={`text-sm ${active ? "font-semibold text-gray-900" : "text-gray-600"}`}
            >
              {t.label}
            </div>
            <div className="text-[11px] text-gray-500">{t.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

function SlackCard({
  settings,
  update,
  errors,
  canSave,
  disabledHint,
  onSave,
}: {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  errors: SlackErrors;
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
}) {
  return (
    <SettingsCard
      title="Slack (リマインダー通知)"
      requiredLabel="任意"
      description="未読記事を Slack で通知したい場合のみ設定してください。 未設定でも保存機能は動作します。"
      canSave={canSave}
      disabledHint={disabledHint}
      onSave={onSave}
    >
      <Field
        label="Slack Bot Token"
        description="Bot User OAuth Token (xoxb-...)。 取得方法は下のセットアップ手順を参照"
        error={errors.slackToken}
      >
        <input
          type="password"
          value={settings.slackBotToken}
          onChange={(e) => update("slackBotToken", e.target.value)}
          placeholder="xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className={inputClass("font-mono", !!errors.slackToken)}
          aria-invalid={!!errors.slackToken}
          autoComplete="off"
        />
      </Field>
      <Field
        label="通知先"
        description="Channel ID (Cxxxx) または User ID (Uxxxx)。 User ID にすると本人 DM に届く"
        error={errors.slackTarget}
      >
        <input
          type="text"
          value={settings.slackTarget}
          onChange={(e) => update("slackTarget", e.target.value)}
          placeholder="C0123ABCDEF または U0123ABCDEF"
          className={inputClass("font-mono", !!errors.slackTarget)}
          aria-invalid={!!errors.slackTarget}
          autoComplete="off"
        />
      </Field>
      <Field
        label="未読リマインド日数"
        description="未読 (Notion DB の「読了」未チェック) のままこの日数が経つと Slack で通知"
        error={errors.reminderDays}
      >
        <input
          type="number"
          min={1}
          max={60}
          value={settings.reminderDays}
          onChange={(e) => update("reminderDays", Number(e.target.value) || 7)}
          className={inputClass("w-32", !!errors.reminderDays)}
          aria-invalid={!!errors.reminderDays}
        />
      </Field>
    </SettingsCard>
  );
}

function SettingsCard({
  title,
  requiredLabel,
  description,
  canSave,
  disabledHint,
  onSave,
  children,
}: {
  title: string;
  requiredLabel: "必須" | "任意";
  description?: string;
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave || state.kind === "saving") return;
      setState({ kind: "saving" });
      try {
        await onSave();
        setState({ kind: "saved" });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "保存に失敗しました",
        });
      }
    },
    [canSave, state.kind, onSave],
  );

  const badgeClass =
    requiredLabel === "必須"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  const displayState =
    state.kind === "saved" && canSave ? { kind: "idle" as const } : state;

  const buttonTitle = !canSave
    ? disabledHint ?? "保存できる変更がありません"
    : "現在の入力を保存します";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <span
            className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${badgeClass}`}
          >
            {requiredLabel}
          </span>
        </div>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </header>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center gap-3 pt-1">
        {/* 無効時もマウスホバーで tooltip を見せるため、 button を span で包む */}
        <span title={buttonTitle} className="inline-flex">
          <button
            type="submit"
            disabled={!canSave || state.kind === "saving"}
            aria-disabled={!canSave || state.kind === "saving"}
            className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.kind === "saving" ? "保存中..." : "この設定を保存"}
          </button>
        </span>
        {displayState.kind === "saved" && (
          <span className="text-sm text-emerald-600">保存しました</span>
        )}
        {displayState.kind === "error" && (
          <span className="text-sm text-rose-600">{displayState.message}</span>
        )}
        {!canSave && disabledHint && displayState.kind === "idle" && (
          <span className="text-xs text-gray-500">{disabledHint}</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {description && (
        <span className="block text-xs text-gray-500">{description}</span>
      )}
      {children}
      {error && (
        <span className="block text-xs text-rose-600 mt-1">{error}</span>
      )}
    </label>
  );
}

function inputClass(extra: string, hasError: boolean): string {
  const base =
    "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const colors = hasError
    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
    : "border-gray-300 focus:ring-brand/30";
  return `${base} ${colors} ${extra}`.trim();
}
