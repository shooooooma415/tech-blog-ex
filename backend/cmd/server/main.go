package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// 技術ブログ収集用バックエンド (Go + Gin)
//
// エンドポイント:
//   GET  /healthz   - 死活監視
//   POST /articles  - 拡張から受け取った記事を Notion DB に保存
//                     (POST /internal/remind は今後追加予定)
//
// 設計メモ:
//   Notion API キーはサーバ側では保持せず、リクエストごとに拡張から受け取る。
//   databaseId が無ければ parentPageId 配下に DB を新規作成してから保存する。
// ============================================================================

func main() {
	r := gin.Default()
	r.Use(cors())

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.POST("/articles", saveArticle)

	addr := ":" + getenv("PORT", "8080")
	log.Printf("backend listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}

// ----------------------------------------------------------------------------
// POST /articles ハンドラ
// ----------------------------------------------------------------------------

const defaultDatabaseTitle = "Tech Blog Articles"

// 拡張から送られてくるリクエストの形。
type saveArticleRequest struct {
	URL          string `json:"url"`
	Title        string `json:"title"`
	NotionAPIKey string `json:"notionApiKey"`
	ParentPageID string `json:"parentPageId"`
	DatabaseID   string `json:"databaseId"`
}

// 拡張に返すレスポンスの形。
type saveArticleResponse struct {
	ID              string `json:"id"`
	URL             string `json:"url"`
	Title           string `json:"title"`
	CreatedAt       string `json:"createdAt"`
	Read            bool   `json:"read"`
	DatabaseID      string `json:"databaseId"`
	DatabaseCreated bool   `json:"databaseCreated"`
}

// saveArticle は記事を Notion に保存する。
// databaseId が空なら parentPageId 配下に DB を新規作成してから保存し、
// 作成した DB ID を返す (拡張側でキャッシュする想定)。
func saveArticle(c *gin.Context) {
	var req saveArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストの形式が不正です"})
		return
	}

	// --- 入力バリデーション ---
	if req.URL == "" || req.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url または title が空です"})
		return
	}
	if req.NotionAPIKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "notionApiKey が空です"})
		return
	}
	if req.DatabaseID == "" && req.ParentPageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "parentPageId か databaseId のどちらかが必要です"})
		return
	}

	// --- DB を用意する (無ければ新規作成) ---
	databaseID := req.DatabaseID
	databaseCreated := false
	if databaseID == "" {
		created, err := createNotionDatabase(req.NotionAPIKey, req.ParentPageID, defaultDatabaseTitle)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Notion DB の作成に失敗しました: " + err.Error()})
			return
		}
		databaseID = created
		databaseCreated = true
	}

	// --- 記事ページを作成する ---
	page, err := createNotionArticlePage(req.NotionAPIKey, databaseID, req.URL, req.Title)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Notion への保存に失敗しました: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, saveArticleResponse{
		ID:              page.ID,
		URL:             req.URL,
		Title:           req.Title,
		CreatedAt:       page.CreatedTime,
		Read:            false,
		DatabaseID:      databaseID,
		DatabaseCreated: databaseCreated,
	})
}

// ----------------------------------------------------------------------------
// Notion API クライアント
// ----------------------------------------------------------------------------

const (
	notionAPIBase = "https://api.notion.com/v1"
	notionVersion = "2022-06-28"
)

// notionRequest は Notion API を叩く共通処理。
// method/path とリクエストボディ (body) を受け取り、レスポンスを out に展開する。
func notionRequest(apiKey, method, path string, body, out any) error {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, notionAPIBase+path, reqBody)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Notion-Version", notionVersion)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("notion api %s %s: status %d: %s", method, path, resp.StatusCode, string(data))
	}
	if out != nil {
		if err := json.Unmarshal(data, out); err != nil {
			return err
		}
	}
	return nil
}

// createNotionDatabase はページ配下に記事保存用 DB を作成し、その ID を返す。
func createNotionDatabase(apiKey, parentPageID, title string) (string, error) {
	body := map[string]any{
		"parent": map[string]any{
			"type":    "page_id",
			"page_id": parentPageID,
		},
		"title": []map[string]any{
			{"type": "text", "text": map[string]any{"content": title}},
		},
		"properties": map[string]any{
			"Title":   map[string]any{"title": map[string]any{}},
			"URL":     map[string]any{"url": map[string]any{}},
			"Read":    map[string]any{"checkbox": map[string]any{}},
			"Created": map[string]any{"created_time": map[string]any{}},
		},
	}

	var out struct {
		ID string `json:"id"`
	}
	if err := notionRequest(apiKey, http.MethodPost, "/databases", body, &out); err != nil {
		return "", err
	}
	return out.ID, nil
}

// notionPage は作成したページの結果。
type notionPage struct {
	ID          string
	CreatedTime string
}

// createNotionArticlePage は DB に記事ページ (Title/URL/Read=false) を作成する。
// Created は created_time プロパティのため Notion 側で自動設定される。
func createNotionArticlePage(apiKey, databaseID, url, title string) (*notionPage, error) {
	body := map[string]any{
		"parent": map[string]any{"database_id": databaseID},
		"properties": map[string]any{
			"Title": map[string]any{
				"title": []map[string]any{
					{"type": "text", "text": map[string]any{"content": title}},
				},
			},
			"URL":  map[string]any{"url": url},
			"Read": map[string]any{"checkbox": false},
		},
	}

	var out struct {
		ID          string `json:"id"`
		CreatedTime string `json:"created_time"`
	}
	if err := notionRequest(apiKey, http.MethodPost, "/pages", body, &out); err != nil {
		return nil, err
	}
	return &notionPage{ID: out.ID, CreatedTime: out.CreatedTime}, nil
}

// ----------------------------------------------------------------------------
// ミドルウェア / ユーティリティ
// ----------------------------------------------------------------------------

// cors は Chrome 拡張 (chrome-extension://...) から叩けるようにする最小の CORS。
// シークレットは Cookie ではなくリクエストボディで渡すため credentials は不要。
func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
