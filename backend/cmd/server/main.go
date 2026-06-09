package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 環境構築用スケルトン。実装は今後追加する。
//
// 計画されているエンドポイント:
//   POST /articles            - 記事 (url, title) を Notion DB に保存
//   POST /internal/remind     - cron から叩いて未読記事を Slack に通知
func main() {
	r := gin.Default()

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	addr := ":" + getenv("PORT", "8080")
	log.Printf("backend listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
