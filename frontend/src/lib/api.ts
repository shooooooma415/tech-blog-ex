import type {
  ApiResult,
  SaveArticleRequest,
  SaveArticleResponse,
} from "./types";

// backend が未実装のためモック実装。
// 将来的には fetch(`${BACKEND_URL}/articles`, ...) に置き換える。
const MOCK_LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function saveArticleMock(
  req: SaveArticleRequest,
): Promise<ApiResult<SaveArticleResponse>> {
  await delay(MOCK_LATENCY_MS);

  if (!req.url || !req.title) {
    return { ok: false, error: "url または title が空です" };
  }
  if (!req.parentPageId && !req.databaseId) {
    return {
      ok: false,
      error: "Notion ページ ID か DB ID のどちらかが必要です",
    };
  }

  // 10% の確率で失敗させて UI エラー表示も確認できるようにする
  if (Math.random() < 0.1) {
    return { ok: false, error: "[mock] Notion API への保存に失敗しました" };
  }

  // databaseId が無ければ「backend が新規作成した」体で mock を返す
  const databaseCreated = !req.databaseId;
  const databaseId =
    req.databaseId ?? `mock-db-${Date.now().toString(36)}`;

  return {
    ok: true,
    data: {
      id: `mock-page-${Date.now()}`,
      url: req.url,
      title: req.title,
      createdAt: new Date().toISOString(),
      read: false,
      databaseId,
      databaseCreated,
    },
  };
}
