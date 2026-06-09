// 各設定値のバリデーション。
// 入力が空 (未入力) のときは ok を返す。 "必須かどうか" は別レイヤで判定する。

export type Validation = { ok: true } | { ok: false; message: string };

export function validateNotionApiKey(v: string): Validation {
  const t = v.trim();
  if (t === "") return { ok: true };
  if (!/^(secret_|ntn_)[A-Za-z0-9_-]+$/.test(t)) {
    return {
      ok: false,
      message: "secret_ または ntn_ で始まる Notion integration secret を入れてください",
    };
  }
  if (t.length < 30) {
    return { ok: false, message: "形式が短すぎます (30文字以上)" };
  }
  return { ok: true };
}

// Notion の Page ID / DB ID は 32桁の hex。 UUID 形式 (8-4-4-4-12) も受け付ける。
export function validateNotionId(v: string, label: string): Validation {
  const t = v.trim();
  if (t === "") return { ok: true };
  const compact = t.replace(/-/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(compact)) {
    return {
      ok: false,
      message: `${label} は 32桁の英数字 (UUID 形式可)。 末尾の "?v=..." は含めないでください`,
    };
  }
  return { ok: true };
}

export function validateSlackBotToken(v: string): Validation {
  const t = v.trim();
  if (t === "") return { ok: true };
  if (!t.startsWith("xoxb-")) {
    return {
      ok: false,
      message: "xoxb- で始まる Bot User OAuth Token を入れてください",
    };
  }
  if (t.length < 30) {
    return { ok: false, message: "形式が短すぎます" };
  }
  return { ok: true };
}

// Slack の channel/user ID。 C (channel) / U (user) / D (DM) / G (group) を許容
export function validateSlackTarget(v: string): Validation {
  const t = v.trim();
  if (t === "") return { ok: true };
  if (!/^[CDGU][A-Z0-9]{8,}$/.test(t)) {
    return {
      ok: false,
      message: "C... (チャンネル) または U... (ユーザー) の ID 形式で入れてください",
    };
  }
  return { ok: true };
}

export function validateReminderDays(n: number): Validation {
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, message: "整数で入力してください" };
  }
  if (n < 1 || n > 60) {
    return { ok: false, message: "1〜60 の範囲で指定してください" };
  }
  return { ok: true };
}

export function errorMessage(v: Validation): string | undefined {
  return v.ok ? undefined : v.message;
}
