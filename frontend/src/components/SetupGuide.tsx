"use client";

import { useState } from "react";

type Section = {
  id: string;
  title: string;
  intro?: string;
  steps: Array<string | { text: string; code?: string }>;
  warn?: string;
};

const NOTION_SECTION: Section = {
  id: "notion",
  title: "Notion 側のセットアップ (1回だけ)",
  intro:
    "「空のページを作る → integration を招待する → そのページ ID を貼る」だけ。 DB 本体は初回保存時に backend が必要なプロパティ込みで自動作成します。",
  steps: [
    {
      text: "https://www.notion.so/my-integrations を開き「New integration」をクリック",
    },
    {
      text: "名前を入れて (例: Tech Blog Saver)、 関連付けるワークスペースを選び「Submit」",
    },
    {
      text: "発行された「Internal Integration Secret」(secret_xxxxx で始まる) をコピー → 上の「Notion API キー」フィールドに貼る",
    },
    {
      text: "Notion で **空のページを新規作成** する (例: 「Tech Blog」)。 既存 DB に書き込みたい場合は下の「高度な設定」を使ってください",
    },
    {
      text: "作ったページの右上「...」→「Connections」→ 上で作った integration を選んで Confirm。 招待しないと backend は触れない",
    },
    {
      text: "ページ URL の末尾 32桁をコピー → 上の「保存先ページ ID」フィールドに貼る",
      code: "https://www.notion.so/yourworkspace/Tech-Blog-<32桁のページID>\n                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
    },
    {
      text: "popup から最初の 1 件を保存すると backend がそのページ配下に DB を作成し、 ID を拡張側にキャッシュします。 2 回目以降は同じ DB へ追記されます",
    },
    {
      text: "(参考) auto モードで自動作成される DB のプロパティは次の 4 つです",
      code: "Name     (Title)         記事タイトル\nURL      (URL)           記事 URL\n読了     (Checkbox)      true で通知対象から除外\nCreated  (Created time)  保存日時。 リマインド (N日経過判定) に使用",
    },
  ],
  warn: "integration はこのページだけに招待する。 workspace 全体には絶対に共有しない",
};

const SLACK_SECTION: Section = {
  id: "slack",
  title: "Slack 側のセットアップ (1回だけ)",
  intro: "未読リマインダーを送るための Slack bot を作ります。",
  steps: [
    {
      text: "https://api.slack.com/apps を開き「Create New App」→「From scratch」",
    },
    {
      text: "App 名 (例: Tech Blog Reminder) と通知したい workspace を選んで Create",
    },
    {
      text: "左メニュー「OAuth & Permissions」→「Bot Token Scopes」に必要な scope を追加",
      code: "chat:write           // メッセージ送信 (必須)\nim:write             // DM で送りたい場合\nchat:write.public    // bot を招待していないチャンネルにも送る場合",
    },
    {
      text: "同ページ上部「Install to Workspace」→ 許可。 発行された「Bot User OAuth Token」(xoxb-...) をコピー → 上の「Slack Bot Token」フィールドに貼る",
    },
    {
      text: "通知先のチャンネル ID または User ID を「通知先」フィールドに入れる。 ID はチャンネル/プロフィールの「Copy link」末尾から取れる",
      code: "チャンネルID: C0123ABCDEF\nユーザーID:   U0123ABCDEF",
    },
    {
      text: "通知したいチャンネルで /invite @<bot 名> して bot を招待 (DM のみで使うなら不要)",
    },
  ],
  warn: "scope は最小限にする。 token は他人と共有しない (このページに貼られた値は chrome.storage.local に保存される)",
};

const SECURITY_SECTION: Section = {
  id: "security",
  title: "シークレット保管に関する注意 (重要)",
  intro:
    "GUI で token を管理する構成は便利ですが、 セキュリティ的な前提を理解した上で使ってください。",
  steps: [
    {
      text: "このページに入力した値は chrome.storage.local に平文で保存されます (Chrome プロファイル配下のファイル)。 OS にログインできる人は読めます",
    },
    {
      text: "拡張をアンインストールするとデータは削除されます。 別マシンに移行する場合は、 各 token を再入力してください (同期はされません)",
    },
    {
      text: "万一 token が漏れたら、 Notion 側は integration を revoke、 Slack 側は OAuth & Permissions から rotate して下さい",
    },
    {
      text: "拡張から backend への通信は localhost を除き必ず HTTPS にする (Backend URL のバリデーションでも弾いています)",
    },
  ],
  warn: "本格運用するなら OAuth フローに移行して、 拡張側には short-lived な access token のみを置く構成を推奨",
};

const SECTIONS: Section[] = [NOTION_SECTION, SLACK_SECTION, SECURITY_SECTION];

export function SetupGuide() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">セットアップ手順</h2>
      <p className="text-xs text-gray-600">
        初回のみ Notion と Slack 側で 1 回ずつ作業が必要です。 取得した値はこのページの各フィールドに貼ります。
      </p>
      <div className="space-y-2">
        {SECTIONS.map((s) => (
          <Disclosure key={s.id} section={s} />
        ))}
      </div>
    </section>
  );
}

function Disclosure({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        <span className="font-medium text-sm">{section.title}</span>
        <span
          aria-hidden
          className={`text-xs text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
          {section.intro && <p className="text-gray-600">{section.intro}</p>}
          <ol className="list-decimal list-outside ml-5 space-y-2">
            {section.steps.map((step, i) => {
              const obj = typeof step === "string" ? { text: step } : step;
              return (
                <li key={i} className="text-gray-800 leading-relaxed">
                  {obj.text}
                  {obj.code && (
                    <pre className="mt-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-700 overflow-x-auto">
                      <code>{obj.code}</code>
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>
          {section.warn && (
            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-2">
              <span className="font-semibold">注意: </span>
              {section.warn}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
