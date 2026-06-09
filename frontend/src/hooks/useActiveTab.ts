"use client";

import { useEffect, useState } from "react";
import { getActiveTabInfo, type ActiveTabInfo } from "@/lib/activeTab";

/**
 * popup 起動時に chrome.tabs から現在のタブ情報を 1 回取得する hook。
 * dev では window.location をフォールバックとして使う。
 */
export function useActiveTab(): ActiveTabInfo | null {
  const [tab, setTab] = useState<ActiveTabInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const info = await getActiveTabInfo();
      if (mounted) setTab(info);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return tab;
}
