"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export type SettingsKey = keyof AppSettings;

export type UseSettingsResult = {
  settings: AppSettings;
  savedSettings: AppSettings;
  /** 個別フィールドを更新 (in-memory のみ) */
  update: <K extends SettingsKey>(key: K, value: AppSettings[K]) => void;
  /** 任意のキー集合に対する dirty 判定 */
  isDirty: (keys: ReadonlyArray<SettingsKey>) => boolean;
  /** 現在の settings を永続化 */
  persist: () => Promise<void>;
  /** popup などから書き換えた結果を即時反映するための setter */
  setSettings: (next: AppSettings) => void;
  loaded: boolean;
};

/**
 * settings の load / save / dirty 判定をまとめた hook。
 *
 * - 初期 mount で `chrome.storage.local` (or dev は localStorage) から読み出し
 * - `update(key, value)` でローカル変更
 * - `persist()` で書き込み + savedSettings の更新
 * - `isDirty(["notionApiKey", "notionParentPageId"])` のように比較対象キーを渡して局所 dirty を取れる
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await loadSettings();
      if (!mounted) return;
      setSettingsState(s);
      setSavedSettings(s);
      setLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(
    <K extends SettingsKey>(key: K, value: AppSettings[K]) => {
      setSettingsState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const isDirty = useCallback(
    (keys: ReadonlyArray<SettingsKey>) => {
      for (const k of keys) {
        if (settings[k] !== savedSettings[k]) return true;
      }
      return false;
    },
    [settings, savedSettings],
  );

  const persist = useCallback(async () => {
    await saveSettings(settings);
    setSavedSettings(settings);
  }, [settings]);

  const setSettings = useCallback((next: AppSettings) => {
    setSettingsState(next);
    setSavedSettings(next);
  }, []);

  return { settings, savedSettings, update, isDirty, persist, setSettings, loaded };
}
