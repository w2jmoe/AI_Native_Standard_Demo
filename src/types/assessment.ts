export type AssessmentAnswers = {
  problem: string;
  collaboration: string;
  solution: string;
  judgment: string;
  iteration: string;
};

export type LocalizedText = {
  zh: string;
  en: string;
};

export type DimensionKey =
  | "problemFraming"
  | "aiCollaboration"
  | "judgment"
  | "execution"
  | "iteration";

export type DimensionScores = Record<DimensionKey, number>;

export type EvaluationDimension = {
  name: DimensionKey;
  score: number;
  nameZh: string;
  nameEn: string;
};

/** Structured evaluation returned by /api/evaluate */
export type EvaluationResult = {
  score: number;
  /** Stable id for badge mapping, derived from profile.en */
  profileId: string;
  profile: LocalizedText;
  dimensions: EvaluationDimension[];
  strength: LocalizedText;
  growthOpportunity: LocalizedText;
};

export const ASSESSMENT_STORAGE_KEY = "ans-assessment-answers";
export const EVALUATION_STORAGE_KEY = "ans-evaluation-result";

export const dimensionMeta: Record<
  DimensionKey,
  { en: string; zh: string }
> = {
  problemFraming: { en: "Problem Framing", zh: "问题定义" },
  aiCollaboration: { en: "AI Collaboration", zh: "AI协作" },
  judgment: { en: "Judgment", zh: "判断能力" },
  execution: { en: "Execution", zh: "执行交付" },
  iteration: { en: "Iteration", zh: "迭代优化" },
};

export function pickLocalized(
  text: LocalizedText | string | undefined,
  locale: "en" | "zh",
): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[locale] || text.en || text.zh || "";
}
