// 拡張の GUI が扱うのは「ユーザーごとに変わる値」のみ。
// Backend URL はビルド時定数 (src/lib/config.ts) で持つため、ここには含めない。
// シークレット (Notion API キー / Slack Bot Token) は chrome.storage.local に
// 保存される。 ユーザーマシンの Chrome プロファイルにアクセスできる人には
// 読める前提で運用する。
export type NotionMode = "auto" | "manual";

export type AppSettings = {
  notionApiKey: string;
  // "auto": ページ ID 配下に backend が DB を自動作成 (推奨)
  // "manual": 既存の DB を直接指定する (上級者向け)
  notionMode: NotionMode;
  // auto モードで使うページ ID
  notionParentPageId: string;
  // manual モードで使う DB ID。 auto モードでは backend が作成した DB ID のキャッシュ
  notionDatabaseId: string;
  slackBotToken: string;
  slackTarget: string; // Channel ID (Cxxxx) or User ID (Uxxxx)
  reminderDays: number;
};

export type SaveArticleRequest = {
  url: string;
  title: string;
  // backend が DB を作る/特定するための情報
  parentPageId: string;
  databaseId?: string; // 既に作成済みならこの DB を使う
};

export type SaveArticleResponse = {
  id: string;
  url: string;
  title: string;
  createdAt: string;
  read: boolean;
  // backend が今回 DB を新規作成した場合に返す。 拡張側でキャッシュする。
  databaseId: string;
  databaseCreated: boolean;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
