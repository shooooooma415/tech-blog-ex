import type { AppSettings } from "./types";

const SETTINGS_KEY = "tech-blog-ex:settings";
const SAVED_KEY = "tech-blog-ex:saved";

export const DEFAULT_SETTINGS: AppSettings = {
  notionApiKey: "",
  notionMode: "auto",
  notionParentPageId: "",
  notionDatabaseId: "",
  slackBotToken: "",
  slackTarget: "",
  reminderDays: 7,
};

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined"
  );
}

export async function loadSettings(): Promise<AppSettings> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    const stored = result[SETTINGS_KEY] as Partial<AppSettings> | undefined;
    return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  }
  if (typeof localStorage === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    return;
  }
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export type SavedArticleLog = {
  id: string;
  url: string;
  title: string;
  savedAt: string;
};

export async function appendSavedLog(entry: SavedArticleLog): Promise<void> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(SAVED_KEY);
    const existing = (result[SAVED_KEY] as SavedArticleLog[] | undefined) ?? [];
    await chrome.storage.local.set({ [SAVED_KEY]: [entry, ...existing].slice(0, 20) });
    return;
  }
  if (typeof localStorage === "undefined") return;
  const raw = localStorage.getItem(SAVED_KEY);
  const existing: SavedArticleLog[] = raw ? JSON.parse(raw) : [];
  localStorage.setItem(
    SAVED_KEY,
    JSON.stringify([entry, ...existing].slice(0, 20)),
  );
}

export async function loadSavedLog(): Promise<SavedArticleLog[]> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(SAVED_KEY);
    return (result[SAVED_KEY] as SavedArticleLog[] | undefined) ?? [];
  }
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(SAVED_KEY);
  return raw ? (JSON.parse(raw) as SavedArticleLog[]) : [];
}
