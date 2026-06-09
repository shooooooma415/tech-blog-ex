export type ActiveTabInfo = {
  url: string;
  title: string;
};

const MOCK_TAB: ActiveTabInfo = {
  url: "https://example.com/blog/great-article",
  title: "Mock: 素晴らしい技術記事",
};

export async function getActiveTabInfo(): Promise<ActiveTabInfo> {
  if (
    typeof chrome !== "undefined" &&
    typeof chrome.tabs !== "undefined" &&
    typeof chrome.tabs.query === "function"
  ) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab?.url) {
      return {
        url: tab.url,
        title: tab.title ?? tab.url,
      };
    }
  }
  // dev / Next.js プレビュー用フォールバック
  if (typeof window !== "undefined") {
    return {
      url: window.location.href,
      title: document.title || MOCK_TAB.title,
    };
  }
  return MOCK_TAB;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallthrough */
  }
  return false;
}
