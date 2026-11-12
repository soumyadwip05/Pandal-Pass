import type { Pass, Prefs } from "./types";

export function loadPrefs(key: string): Prefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

export function savePrefs(key: string, prefs: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    // Storage may be unavailable in private or restricted browsing modes.
  }
}

export function loadPass(key: string): Pass | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Pass) : null;
  } catch {
    return null;
  }
}

export function savePass(key: string, pass: Pass): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(pass));
  } catch {
    // Storage may be unavailable in private or restricted browsing modes.
  }
}
