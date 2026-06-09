/**
 * options ページを開く処理。 chrome.tabs.create を優先 (確実)、
 * 失敗時は openOptionsPage → window.open に順次フォールバック。
 *
 * options_ui の設定との相性で openOptionsPage が "Could not create an
 * options page." を投げるケースがあるため、 chrome.tabs.create を第一候補にする。
 */
export async function openOptionsPage(): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime?.getURL) {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("options/index.html"),
      });
      if (typeof window !== "undefined") window.close();
      return;
    } catch (e) {
      console.error("[tech-blog-ex] chrome.tabs.create failed:", e);
    }
  }
  if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
    try {
      await chrome.runtime.openOptionsPage();
      return;
    } catch (e) {
      console.error("[tech-blog-ex] openOptionsPage failed:", e);
    }
  }
  if (typeof window !== "undefined") {
    window.open("/options/", "_blank");
  }
}
