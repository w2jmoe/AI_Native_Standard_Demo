import type { AssessmentAnswers, DimensionKey } from "@/types/assessment";
import type { TaskEvaluationConfig } from "@/lib/tasks/types";
import {
  ANS_CORE_FEEDBACK_AND_OUTPUT,
  ANS_CORE_INTRO,
  ANS_CORE_INVALID_PATTERNS,
  ANS_CORE_PROFILE,
  ANS_CORE_SCORING_PRINCIPLES,
  ANS_DIMENSION_ORDER,
  ANS_DIMENSION_TITLES,
} from "./corePrompt";

function weightsAreEqual(config: TaskEvaluationConfig): boolean {
  const values = ANS_DIMENSION_ORDER.map((k) => config.dimensionWeights[k]);
  return values.every((v) => Math.abs(v - values[0]) < 1e-9);
}

function formatWeightLine(config: TaskEvaluationConfig): string {
  if (weightsAreEqual(config)) {
    return "Score five dimensions equally (20% each). Each dimension score is an integer from 0 to 100.";
  }
  const parts = ANS_DIMENSION_ORDER.map((key) => {
    const pct = Math.round(config.dimensionWeights[key] * 100);
    return `${ANS_DIMENSION_TITLES[key]} ${pct}%`;
  });
  return `Score five dimensions with task weights (${parts.join(", ")}). Each dimension score is an integer from 0 to 100.`;
}

function formatOverallScoreLine(config: TaskEvaluationConfig): string {
  if (weightsAreEqual(config)) {
    return "Overall ANS score (0–100) = equal weight across the five dimensions.";
  }
  return "Overall ANS score (0–100) = weighted average across the five dimensions using the task weights above.";
}

function evidenceFromLabel(
  config: TaskEvaluationConfig,
  dimension: DimensionKey,
): string {
  if (dimension === "judgment") {
    return "inferred across ALL evidence — there is NO separate judgment field";
  }
  const field = config.evidenceFields.find((f) => f.mapsTo === dimension);
  if (field) return `from ${field.label.en}`;
  return "from overall evidence";
}

function buildDimensionSection(config: TaskEvaluationConfig): string {
  const lines = ANS_DIMENSION_ORDER.map((key, index) => {
    const title = ANS_DIMENSION_TITLES[key];
    const from = evidenceFromLabel(config, key);
    const criteria =
      config.scoringCriteria[key]?.trim() ||
      `Evaluate ${title} from the submitted work evidence.`;
    return `### ${index + 1}. ${title} (${from})\n${criteria}`;
  });
  return `## What to evaluate\n\n${formatWeightLine(config)}\n\n${lines.join("\n\n")}`;
}

/**
 * System prompt = ANS Core + task scoring criteria / weights.
 */
export function buildSystemPrompt(config: TaskEvaluationConfig): string {
  return [
    ANS_CORE_INTRO,
    "",
    buildDimensionSection(config),
    "",
    ANS_CORE_SCORING_PRINCIPLES,
    "",
    formatOverallScoreLine(config),
    "",
    ANS_CORE_INVALID_PATTERNS,
    "",
    ANS_CORE_PROFILE,
    "",
    ANS_CORE_FEEDBACK_AND_OUTPUT,
  ].join("\n");
}

/**
 * User prompt = task context + evidence blocks from config mapping.
 */
export function buildUserPrompt(
  config: TaskEvaluationConfig,
  answers: AssessmentAnswers,
): string {
  const evidenceBlocks = config.evidenceFields
    .map((field, index) => {
      const body = answers[field.key] ?? "";
      return `[Part ${index + 1} — ${field.label.en}]\n${body}`;
    })
    .join("\n\n");

  return `Task context: ${config.taskName.en} (ANS Demo 2.0)
Role: ${config.role.en}
Situation: ${config.situation.en}

${config.evaluationInstructions}

Their evidence:

${evidenceBlocks}

Evaluate now and return JSON only.`;
}

export type EvaluationPromptPair = {
  system: string;
  user: string;
};

export function buildEvaluationPrompt(
  config: TaskEvaluationConfig,
  answers: AssessmentAnswers,
): EvaluationPromptPair {
  return {
    system: buildSystemPrompt(config),
    user: buildUserPrompt(config, answers),
  };
}
