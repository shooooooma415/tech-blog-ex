// Tech Blog Saver - service worker (MV3)
// 現状は最小限のロギングのみ。backend 実装後、ここから fetch を呼ぶ形にしてもよい。

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log("[tech-blog-ex] installed:", reason);
});

chrome.action.onClicked?.addListener?.((tab) => {
  console.log("[tech-blog-ex] action clicked", tab?.url);
});
