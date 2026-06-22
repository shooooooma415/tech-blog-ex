# backend

Go + Gin の API サーバ。コードは学習用にあえて `cmd/server/main.go` 一本にまとめている。

## セットアップ

```bash
cd backend
go mod tidy
go run ./cmd/server
```

`http://localhost:8080/healthz` で動作確認。

## エンドポイント

| Endpoint                | 状態   | 内容                                                          |
| ----------------------- | ------ | ------------------------------------------------------------- |
| `GET /healthz`          | 実装済 | 死活監視                                                      |
| `POST /articles`        | 実装済 | 拡張から受け取った記事を Notion DB に保存 (無ければ DB を作成) |
| `POST /internal/remind` | 未実装 | cron から叩き、未読かつ閾値超過を Slack 通知                   |

### `POST /articles`

```jsonc
// request
{
  "url": "https://example.com/post",
  "title": "記事タイトル",
  "notionApiKey": "secret_xxx",   // サーバは保持せず毎回受け取る
  "parentPageId": "xxxx",          // databaseId が無いときに DB を作る親ページ
  "databaseId": "yyyy"             // 既存 DB を使う場合 (任意)
}
```

`databaseId` が空のときは `parentPageId` 配下に DB を新規作成し、レスポンスの
`databaseId` / `databaseCreated: true` を返す。拡張側で `databaseId` をキャッシュする。

## シークレットの扱い

Notion API キーは **拡張のリクエストボディ** で受け取る方針 (サーバには保存しない)。
そのため `.env` には `PORT` 程度しか必要ない。Slack 通知 (`/internal/remind`) を実装する
際にトークン管理を再検討する。
