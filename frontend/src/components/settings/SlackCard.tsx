import { Field, NumberInput, PasswordInput, TextInput } from "@/components/forms";
import { SettingsCard } from "./SettingsCard";
import type { AppSettings } from "@/lib/types";

export type SlackCardProps = {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  errors: {
    slackToken?: string;
    slackTarget?: string;
    reminderDays?: string;
  };
  canSave: boolean;
  disabledHint?: string;
  onSave: () => Promise<void>;
};

export function SlackCard({
  settings,
  update,
  errors,
  canSave,
  disabledHint,
  onSave,
}: SlackCardProps) {
  return (
    <SettingsCard
      title="Slack (リマインダー通知)"
      requiredLevel="任意"
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
        <PasswordInput
          value={settings.slackBotToken}
          onChange={(v) => update("slackBotToken", v)}
          placeholder="xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          error={!!errors.slackToken}
        />
      </Field>
      <Field
        label="通知先"
        description="Channel ID (Cxxxx) または User ID (Uxxxx)。 User ID にすると本人 DM に届く"
        error={errors.slackTarget}
      >
        <TextInput
          value={settings.slackTarget}
          onChange={(v) => update("slackTarget", v)}
          placeholder="C0123ABCDEF または U0123ABCDEF"
          mono
          error={!!errors.slackTarget}
        />
      </Field>
      <Field
        label="未読リマインド日数"
        description="未読 (Notion DB の「読了」未チェック) のままこの日数が経つと Slack で通知"
        error={errors.reminderDays}
      >
        <NumberInput
          value={settings.reminderDays}
          onChange={(v) => update("reminderDays", v)}
          min={1}
          max={60}
          fallback={7}
          className="w-32"
          error={!!errors.reminderDays}
        />
      </Field>
    </SettingsCard>
  );
}
