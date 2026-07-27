import {
  resolveDisplayName,
  type AssessmentAnswers,
  type EvaluationResult,
} from "@/types/assessment";
import { getSupabaseAdmin } from "./client";

function dimensionScore(
  result: EvaluationResult,
  name: EvaluationResult["dimensions"][number]["name"],
): number {
  return result.dimensions.find((d) => d.name === name)?.score ?? 0;
}

/**
 * Persist anonymous assessment for ANS model research.
 * Never throw — save failures must not block the user result flow.
 */
export async function saveAssessmentRecord(options: {
  answers: AssessmentAnswers;
  result: EvaluationResult;
  locale: "en" | "zh";
  displayName?: string | null;
  /** Early Experiment channel tag from ?source=; null when absent. */
  source?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skip save.",
    );
    return;
  }

  const { answers, result, locale, displayName, source } = options;

  // Keep Demo 1.0 columns; map 4 Evidence → existing text columns.
  // judgment_answer packs report extras as JSON (no schema rewrite).
  // display_name / source are additive and nullable for backward compatibility.
  const { error } = await supabase.from("assessments").insert({
    locale,
    score: result.score,
    profile: result.profileId,
    display_name: resolveDisplayName(displayName),
    source: source ?? null,
    problem_framing_score: dimensionScore(result, "problemFraming"),
    ai_collaboration_score: dimensionScore(result, "aiCollaboration"),
    judgment_score: dimensionScore(result, "judgment"),
    execution_score: dimensionScore(result, "execution"),
    iteration_score: dimensionScore(result, "iteration"),
    problem_answer: answers.problemAnalysis,
    collaboration_answer: answers.aiCollaborationEvidence,
    solution_answer: answers.solutionProposal,
    judgment_answer: JSON.stringify({
      hiringSignal: result.hiringSignal,
      evidenceSummary: result.evidenceSummary,
    }),
    iteration_answer: answers.iterationPlan,
  });

  if (error) {
    console.error("[supabase] Failed to save assessment:", error.message);
  }
}
