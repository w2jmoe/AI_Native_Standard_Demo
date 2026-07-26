import { normalizeCachedResult } from "@/lib/evaluation/parse";
import {
  resolveDisplayName,
  type AssessmentAnswers,
  type EvaluationResult,
} from "@/types/assessment";
import type { Locale } from "@/lib/i18n/translations";

export const RESULT_CACHE_KEY = "ans-result-cache";

export type ResultCache = {
  answers: AssessmentAnswers;
  result: EvaluationResult;
  displayName: string;
  locale: Locale;
  savedAt: string;
};

export function saveResultCache(
  answers: AssessmentAnswers,
  result: EvaluationResult,
  locale: Locale,
  displayName = "",
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ResultCache = {
      answers,
      result,
      displayName: resolveDisplayName(displayName),
      locale,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(payload));
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
    };
    const result = normalizeCachedResult(parsed.result);
    if (!result || !parsed.answers) return null;
    return {
      answers: parsed.answers,
      result,
      displayName: resolveDisplayName(parsed.displayName),
      locale: parsed.locale === "zh" ? "zh" : "en",
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
