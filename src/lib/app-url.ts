// The installed app opens whatever address the admin approved on this device.
export const DEFAULT_APP_URL = "https://whispering-catalog-compass.lovable.app";
const KEY = "rafal_app_url";
// Addresses and cached lists saved by the app before the Rafal rebrand.
const OLD_KEYS = ["app_base_url", "catalogs-list", "recent-catalogs"];

export function normalizeUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

export function getSavedAppUrl(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_APP_URL;
  } catch {
    return DEFAULT_APP_URL;
  }
}

export function saveAppUrl(url: string) {
  localStorage.setItem(KEY, url);
}

// On launch, move to the approved address if this copy runs elsewhere (published app only).
export function followSavedAppUrl() {
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    Object.keys(localStorage).filter((k) => k.startsWith("cat-info:")).forEach((k) => localStorage.removeItem(k));
  } catch {}
  if (!import.meta.env.PROD) return;
  const saved = localStorage.getItem(KEY);
  if (!saved) return;
  const here = window.location.origin;
  if (saved === here || /(id-preview|preview)--|lovableproject/.test(window.location.hostname)) return;
  window.location.replace(saved + window.location.pathname + window.location.search);
}
