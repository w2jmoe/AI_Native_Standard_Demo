/** Lightweight Early Experiment traffic source (URL ?source=). */

export const SOURCE_STORAGE_KEY = "ans-traffic-source";

const MAX_SOURCE_LEN = 64;

/**
 * Normalize a campaign/source tag.
 * Returns null when missing or invalid — never invent a default string.
 */
export function normalizeSource(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, MAX_SOURCE_LEN);
  if (!trimmed) return null;
  // Keep tags simple for channel analysis (e.g. founder_outreach).
  if (!/^[a-zA-Z0-9_.:-]+$/.test(trimmed)) return null;
  return trimmed;
}

export function readStoredSource(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeSource(window.sessionStorage.getItem(SOURCE_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Read ?source= from the current URL and persist for the session
 * so Landing → Assessment → Submit keeps the same channel tag.
 */
export function captureSourceFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeSource(params.get("source"));
    if (fromUrl) {
      window.sessionStorage.setItem(SOURCE_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
  } catch {
    // Ignore private mode / malformed URL.
  }

  return readStoredSource();
}
