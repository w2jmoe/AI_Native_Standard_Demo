import type {
  AssessmentAnswers,
  EvaluationResult,
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
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skip save.",
    );
    return;
  }

  const { answers, result, locale } = options;

  const { error } = await supabase.from("assessments").insert({
    locale,
    score: result.score,
    profile: result.profileId,
    problem_framing_score: dimensionScore(result, "problemFraming"),
    ai_collaboration_score: dimensionScore(result, "aiCollaboration"),
    judgment_score: dimensionScore(result, "judgment"),
    execution_score: dimensionScore(result, "execution"),
    iteration_score: dimensionScore(result, "iteration"),
    problem_answer: answers.problem,
    collaboration_answer: answers.collaboration,
    solution_answer: answers.solution,
    judgment_answer: answers.judgment,
    iteration_answer: answers.iteration,
  });

  if (error) {
    console.error("[supabase] Failed to save assessment:", error.message);
  }
}
