import { Disclosure } from "@/components/forms";
import { StepList, WarnBlock, type Step } from "./StepList";

const STEPS: ReadonlyArray<Step> = [
  "このページに入力した値は chrome.storage.local に平文で保存されます (Chrome プロファイル配下のファイル)。 OS にログインできる人は読めます",
  "拡張をアンインストールするとデータは削除されます。 別マシンに移行する場合は、 各 token を再入力してください (同期はされません)",
  "万一 token が漏れたら、 Notion 側は integration を revoke、 Slack 側は OAuth & Permissions から rotate して下さい",
  "拡張から backend への通信は localhost を除き必ず HTTPS にする (Backend URL のバリデーションでも弾いています)",
];

export function SecuritySection() {
  return (
    <Disclosure title="シークレット保管に関する注意 (重要)">
      <p className="text-gray-600">
        GUI で token を管理する構成は便利ですが、 セキュリティ的な前提を理解した上で使ってください。
      </p>
      <StepList steps={STEPS} />
      <WarnBlock>
        本格運用するなら OAuth フローに移行して、 拡張側には short-lived な access token のみを置く構成を推奨
      </WarnBlock>
    </Disclosure>
  );
}
