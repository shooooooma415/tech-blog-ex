import { BACKEND_URL } from "./config";
import type {
  ApiResult,
  SaveArticleRequest,
  SaveArticleResponse,
} from "./types";

// backend (`POST /articles`) に記事を保存する。
// Notion API キーはリクエストボディで送る (サーバは保持しない方針)。
export async function saveArticle(
  req: SaveArticleRequest,
): Promise<ApiResult<SaveArticleResponse>> {
  try {
    const res = await fetch(`${BACKEND_URL}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const error =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : `保存に失敗しました (HTTP ${res.status})`;
      return { ok: false, error };
    }

    return { ok: true, data: data as SaveArticleResponse };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `backend に接続できませんでした: ${e.message}`
          : "backend に接続できませんでした",
    };
  }
}
