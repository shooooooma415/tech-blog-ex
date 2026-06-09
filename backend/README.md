# backend

Go + Gin の API サーバ。現状は **環境構築のみ** で、API の本実装はこれから。

## セットアップ

```bash
cd backend
go mod tidy
go run ./cmd/server
```

`http://localhost:8080/healthz` で動作確認。

## 設計予定

| Endpoint                | 内容                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `POST /articles`        | 拡張から受け取った `{url, title}` を Notion DB に保存       |
| `POST /internal/remind` | cron から叩き、未読 (チェック無し) かつ閾値超過を Slack 通知 |

Notion API キーや Slack Webhook は `.env` で管理する (`.env.example` 参照)。
