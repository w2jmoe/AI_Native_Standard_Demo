/**
 * Compatibility exports for evaluation entrypoints.
 * Prefer buildEvaluationPrompt(getTaskConfig(), answers) for multi-task use.
 */
import type { AssessmentAnswers } from "@/types/assessment";
import { getTaskConfig } from "@/lib/tasks";
import {
  buildEvaluationPrompt,
  buildSystemPrompt,
  buildUserPrompt as buildConfiguredUserPrompt,
} from "./buildEvaluationPrompt";

const DEFAULT_TASK = getTaskConfig();

/** Default-task system prompt (product-growth-v1). */
export const ANS_SYSTEM_PROMPT = buildSystemPrompt(DEFAULT_TASK);

/** Default-task user prompt builder (product-growth-v1). */
export function buildUserPrompt(answers: AssessmentAnswers): string {
  return buildConfiguredUserPrompt(DEFAULT_TASK, answers);
}

export { buildEvaluationPrompt, buildSystemPrompt };
