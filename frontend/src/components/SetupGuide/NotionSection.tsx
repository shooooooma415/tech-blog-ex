import { Disclosure } from "@/components/forms";
import { StepList, WarnBlock, type Step } from "./StepList";

const STEPS: ReadonlyArray<Step> = [
  "https://www.notion.so/my-integrations を開き「New integration」をクリック",
  "名前を入れて (例: Tech Blog Saver)、 関連付けるワークスペースを選び「Submit」",
  "発行された「Internal Integration Secret」(secret_xxxxx で始まる) をコピー → 上の「Notion API キー」フィールドに貼る",
  "Notion で **空のページを新規作成** する (例: 「Tech Blog」)。 既存 DB に書き込みたい場合は Notion カードの「既存の DB を使う」タブを使ってください",
  "作ったページの右上「...」→「Connections」→ 上で作った integration を選んで Confirm。 招待しないと backend は触れない",
  {
    text: "ページ URL の末尾 32桁をコピー → 上の「保存先ページ ID」フィールドに貼る",
    code:
      "https://www.notion.so/yourworkspace/Tech-Blog-<32桁のページID>\n                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  },
  "popup から最初の 1 件を保存すると backend がそのページ配下に DB を作成し、 ID を拡張側にキャッシュします。 2 回目以降は同じ DB へ追記されます",
  {
    text: "(参考) auto モードで自動作成される DB のプロパティは次の 4 つです",
    code:
      "Name     (Title)         記事タイトル\nURL      (URL)           記事 URL\n読了     (Checkbox)      true で通知対象から除外\nCreated  (Created time)  保存日時。 リマインド (N日経過判定) に使用",
  },
];

export function NotionSection() {
  return (
    <Disclosure title="Notion 側のセットアップ (1回だけ)">
      <p className="text-gray-600">
        「空のページを作る → integration を招待する → そのページ ID を貼る」だけ。
        DB 本体は初回保存時に backend が必要なプロパティ込みで自動作成します。
      </p>
      <StepList steps={STEPS} />
      <WarnBlock>
        integration はこのページだけに招待する。 workspace 全体には絶対に共有しない
      </WarnBlock>
    </Disclosure>
  );
}
