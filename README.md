# tech-blog-ex

技術ブログを **ワンクリックで Notion に保存** し、 **一週間読まなかったら Slack でリマインド** するブラウザ拡張機能。

> Status: 🚧 frontend は mock 実装で動作。 backend は環境構築のみ (実装はこれから)。

---

## 構成

monorepo。frontend と backend を分離。

```
tech-blog-ex/
├── frontend/          # Next.js (App Router, static export) → Chrome 拡張
│   ├── src/
│   │   ├── app/
│   │   │   ├── popup/page.tsx     # 拡張のポップアップ UI
│   │   │   ├── options/page.tsx   # 拡張の設定ページ
│   │   │   └── page.tsx           # 開発用エントリ (`/`)
│   │   └── lib/
│   │       ├── api.ts             # backend へのリクエスト (現状 mock)
│   │       ├── activeTab.ts       # chrome.tabs ラッパ
│   │       ├── storage.ts         # chrome.storage ラッパ (dev は localStorage)
│   │       └── types.ts
│   ├── public/
│   │   ├── manifest.json          # MV3 manifest
│   │   ├── background.js          # service worker
│   │   └── icons/                 # 拡張アイコン (要 PNG 追加)
│   ├── scripts/pack-extension.mjs # `out/` → `extension-dist/` 組み立て
│   └── next.config.mjs            # `output: 'export'`
│
├── backend/           # Go + Gin (現状スケルトンのみ)
│   ├── cmd/server/main.go         # `GET /healthz` のみ実装済
│   ├── go.mod
│   ├── .env.example
│   └── README.md
│
├── package.json       # ルート (pnpm workspace)
├── pnpm-workspace.yaml
└── README.md
```

---

## 機能概要

### 拡張機能 (Chrome MV3)

- **popup**: 開いているタブの URL とタイトルを表示。「リンクをコピーして Notion に保存」ボタンで:
  - URL をクリップボードへコピー
  - backend に `{url, title}` を POST (現状は mock 応答)
  - 保存履歴を `chrome.storage.local` に記録
- **options**: 接続先 Notion / Slack の設定 UI
  - Notion API キー、Notion DB ID
  - Slack Webhook URL、通知チャンネル、未読リマインド日数

### backend (実装予定)

| Endpoint | 内容 |
|---|---|
| `POST /articles` | 拡張からの `{url, title}` を Notion DB にページ作成 (`読了` プロパティ=false) |
| `POST /internal/remind` | cron から叩く。`読了` が false かつ作成から閾値超過の記事を Slack 通知 |

Notion DB のスキーマ (auto モード時に backend が自動で作成):

| プロパティ | 型 | 用途 |
|---|---|---|
| `Name` | Title | 記事タイトル |
| `URL` | URL | 記事 URL |
| `読了` | Checkbox | true になったら通知対象から除外 |
| `Created` | Created time | 保存日時。リマインダーの「N 日経過」判定に使用 (Notion の組み込み property type) |

manual モードで既存 DB を使う場合は、 **このスキーマを満たしている必要あり** (名前と型が完全一致)。

---

## セットアップ

### 必要なもの

- Node.js 20+
- pnpm 9+
- Go 1.23+ (backend 起動時のみ)

### インストール

```bash
pnpm install              # frontend deps
cd backend && go mod tidy # backend deps
```

### 開発 (frontend)

ブラウザで Next.js dev server を立ち上げて UI を確認 (拡張機能としてではなく通常のページとして):

```bash
pnpm dev
# http://localhost:3000          開発用エントリ
# http://localhost:3000/popup    popup プレビュー
# http://localhost:3000/options  options プレビュー
```

dev モードでは `chrome.*` API が無いので、 `getActiveTabInfo` は現在のページの URL/タイトル、 `storage` は `localStorage` にフォールバックする。

### Chrome 拡張として読み込む

```bash
pnpm build:extension
# → frontend/extension-dist/ に組み上がる
```

1. Chrome の `chrome://extensions/` を開く
2. 右上の **デベロッパーモード** を ON
3. **パッケージ化されていない拡張機能を読み込む** → `frontend/extension-dist/` を選択

アイコンは現状ダミー扱い。`frontend/public/icons/icon-16.png` / `icon-48.png` / `icon-128.png` を入れて再ビルドすると正式アイコンになります。

### 開発 (backend)

```bash
pnpm backend:dev
# → http://localhost:8080/healthz
```

`backend/.env.example` をコピーして `.env` を作成し、Notion / Slack の値を設定 (実装時に使用)。

---

## モック実装について

backend が未実装のため、 `frontend/src/lib/api.ts` の `saveArticleMock` が:

- 600ms のレイテンシをシミュレート
- 10% の確率で失敗 (UI エラー表示の確認用)
- 成功時は擬似的な `id` を返す

backend 実装後、 `saveArticleMock` を実 fetch (例: `POST ${BACKEND_URL}/articles`) に差し替えるだけで動作するように設計してあります。

---

## 今後のTODO

- [ ] backend: `POST /articles` 実装 (Notion SDK 呼び出し)
- [ ] backend: 未読リマインドの cron / Slack 通知ロジック
- [ ] frontend: backend URL の設定項目を options に追加
- [ ] frontend: mock を実 API 呼び出しに置き換え
- [ ] frontend: 拡張アイコン (16/48/128) を作成
- [ ] backend: テストと CI 整備
