import { getSupabaseAdmin } from "./client";

export type HiringSignalValue =
  | "yes_significantly"
  | "yes_somewhat"
  | "not_really"
  | "no";

export type FeedbackRole =
  | "ai_engineer"
  | "product_manager"
  | "growth"
  | "designer"
  | "research"
  | "customer_success"
  | "forward_deployed_engineer"
  | "data_analytics"
  | "other";

export const HIRING_SIGNAL_VALUES: HiringSignalValue[] = [
  "yes_significantly",
  "yes_somewhat",
  "not_really",
  "no",
];

export const FEEDBACK_ROLES: FeedbackRole[] = [
  "ai_engineer",
  "product_manager",
  "growth",
  "designer",
  "research",
  "customer_success",
  "forward_deployed_engineer",
  "data_analytics",
  "other",
];

/**
 * Persist anonymous Early Experiment feedback.
 * Never throw — save failures must not block the result page.
 */
export async function saveExperimentFeedback(options: {
  hiringSignalValue: HiringSignalValue;
  roles: FeedbackRole[];
  locale: "en" | "zh";
  source?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skip feedback save.",
    );
    return { ok: false, error: "Supabase not configured" };
  }

  const { hiringSignalValue, roles, locale, source } = options;

  const { error } = await supabase.from("experiment_feedback").insert({
    locale,
    source: source ?? null,
    hiring_signal_value: hiringSignalValue,
    roles,
  });

  if (error) {
    console.error("[supabase] Failed to save feedback:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
