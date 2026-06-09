import { Field, PasswordInput, TextInput } from "@/components/forms";
import { DatabaseCreatedBadge } from "./DatabaseCreatedBadge";
import { NotionModeTabs } from "./NotionModeTabs";
import { SettingsCard } from "./SettingsCard";
import type { AppSettings } from "@/lib/types";

export type NotionCardProps = {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  errors: {
    apiKey?: string;
    parentPageId?: string;
    databaseId?: string;
  };
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
};

export function NotionCard({
  settings,
  update,
  errors,
  canSave,
  disabledHint,
  onSave,
}: NotionCardProps) {
  return (
    <SettingsCard
      title="Notion"
      requiredLevel="必須"
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
        <PasswordInput
          value={settings.notionApiKey}
          onChange={(v) => update("notionApiKey", v)}
          placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          error={!!errors.apiKey}
        />
      </Field>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          保存先の指定方法
        </div>
        <NotionModeTabs
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
            <TextInput
              value={settings.notionParentPageId}
              onChange={(v) => update("notionParentPageId", v)}
              placeholder="32桁のページID"
              mono
              error={!!errors.parentPageId}
            />
          </Field>
          {settings.notionDatabaseId && (
            <DatabaseCreatedBadge
              databaseId={settings.notionDatabaseId}
              onReset={() => update("notionDatabaseId", "")}
            />
          )}
        </>
      ) : (
        <>
          <Field
            label="Notion DB ID"
            description="DB URL の最後のセグメント (32桁)。 DB には Name (Title) / URL (URL) / 読了 (Checkbox) / Created (Created time) プロパティが必要"
            error={errors.databaseId}
          >
            <TextInput
              value={settings.notionDatabaseId}
              onChange={(v) => update("notionDatabaseId", v)}
              placeholder="32桁のデータベースID"
              mono
              error={!!errors.databaseId}
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
