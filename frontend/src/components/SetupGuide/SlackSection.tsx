import { Disclosure } from "@/components/forms";
import { StepList, WarnBlock, type Step } from "./StepList";

const STEPS: ReadonlyArray<Step> = [
  "https://api.slack.com/apps を開き「Create New App」→「From scratch」",
  "App 名 (例: Tech Blog Reminder) と通知したい workspace を選んで Create",
  {
    text: "左メニュー「OAuth & Permissions」→「Bot Token Scopes」に必要な scope を追加",
    code:
      "chat:write           // メッセージ送信 (必須)\nim:write             // DM で送りたい場合\nchat:write.public    // bot を招待していないチャンネルにも送る場合",
  },
  "同ページ上部「Install to Workspace」→ 許可。 発行された「Bot User OAuth Token」(xoxb-...) をコピー → 上の「Slack Bot Token」フィールドに貼る",
  {
    text: "通知先のチャンネル ID または User ID を「通知先」フィールドに入れる。 ID はチャンネル/プロフィールの「Copy link」末尾から取れる",
    code: "チャンネルID: C0123ABCDEF\nユーザーID:   U0123ABCDEF",
  },
  "通知したいチャンネルで /invite @<bot 名> して bot を招待 (DM のみで使うなら不要)",
];

export function SlackSection() {
  return (
    <Disclosure title="Slack 側のセットアップ (1回だけ)">
      <p className="text-gray-600">
        未読リマインダーを送るための Slack bot を作ります。
      </p>
      <StepList steps={STEPS} />
      <WarnBlock>
        scope は最小限にする。 token は他人と共有しない (このページに貼られた値は{" "}
        <code>chrome.storage.local</code> に保存される)
      </WarnBlock>
    </Disclosure>
  );
}
