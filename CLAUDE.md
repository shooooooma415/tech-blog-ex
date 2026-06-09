# CLAUDE.md

このリポジトリで作業する Claude Code 向けの簡易ガイド。

## プロジェクト概要

技術ブログ収集用のブラウザ拡張 (Chrome MV3)。 monorepo で frontend と backend を分離。

- **frontend** (`frontend/`): Next.js 15 App Router + static export で Chrome 拡張ビルド。
  popup / options / 開発用ホームの 3 ページ。
- **backend** (`backend/`): Go 1.23 + Gin。現状は `GET /healthz` のみのスケルトン。

## よく使うコマンド

```bash
# frontend
pnpm install
pnpm dev                # http://localhost:3000 で popup/options をプレビュー
pnpm --filter frontend typecheck
pnpm build              # next build (static export)
pnpm build:extension    # extension-dist/ に Chrome 拡張形式で出力

# backend
cd backend && go mod tidy
go build ./...
pnpm backend:dev        # ルートから go run ./cmd/server
```

## 設計メモ

- frontend の API 呼び出しは `frontend/src/lib/api.ts` に集約。 backend 未実装のため mock を返している。
  実装が出来たら `saveArticleMock` を実 fetch に置き換える方針。
- 設定値は `chrome.storage.local` に保存 (dev では localStorage にフォールバック、 `frontend/src/lib/storage.ts`)。
- Notion DB スキーマと Slack 通知の責務は backend 側に置く。 拡張は dumb pipe にする。
- Chrome 拡張の manifest は `frontend/public/manifest.json` (MV3)。 build 時にそのまま `out/` 経由で `extension-dist/` にコピーされる。

## ガードレール

- `frontend/extension-dist/` と `frontend/out/` はビルド成果物。コミット禁止。
- backend の Notion API キー / Slack Webhook は `.env` で扱う。 `.env.example` を参照。
- 拡張のアイコン (`frontend/public/icons/icon-{16,48,128}.png`) は未配置。 必要になったら追加。
