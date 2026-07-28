import { normalizeCachedResult } from "@/lib/evaluation/parse";
import {
  resolveDisplayName,
  type AssessmentAnswers,
  type EvaluationResult,
} from "@/types/assessment";
import type { Locale } from "@/lib/i18n/translations";

export const RESULT_CACHE_KEY = "ans-result-cache";
export const SHARE_TOKEN_STORAGE_KEY = "ans-share-token";

export type ResultCache = {
  answers: AssessmentAnswers;
  result: EvaluationResult;
  displayName: string;
  locale: Locale;
  savedAt: string;
  /** assessments.id used as /profile/{token} share link. */
  shareToken?: string | null;
};

export function saveResultCache(
  answers: AssessmentAnswers,
  result: EvaluationResult,
  locale: Locale,
  displayName = "",
  shareToken: string | null = null,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ResultCache = {
      answers,
      result,
      displayName: resolveDisplayName(displayName),
      locale,
      savedAt: new Date().toISOString(),
      shareToken,
    };
    window.localStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(payload));
    if (shareToken) {
      window.sessionStorage.setItem(SHARE_TOKEN_STORAGE_KEY, shareToken);
    } else {
      window.sessionStorage.removeItem(SHARE_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function loadResultCache(): ResultCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESULT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      answers?: AssessmentAnswers;
      result?: unknown;
      displayName?: string;
      locale?: Locale;
      savedAt?: string;
      shareToken?: string | null;
    };
    const result = normalizeCachedResult(parsed.result);
    if (!result || !parsed.answers) return null;
    const shareToken =
      typeof parsed.shareToken === "string" && parsed.shareToken
        ? parsed.shareToken
        : window.sessionStorage.getItem(SHARE_TOKEN_STORAGE_KEY);
    return {
      answers: parsed.answers,
      result,
      displayName: resolveDisplayName(parsed.displayName),
      locale: parsed.locale === "zh" ? "zh" : "en",
      savedAt: parsed.savedAt || new Date().toISOString(),
      shareToken,
    };
  } catch {
    return null;
  }
}
