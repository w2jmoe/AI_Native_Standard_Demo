import type { DimensionKey, LocalizedText } from "@/types/assessment";

/** Stable Evidence keys used by AssessmentAnswers (Demo 2.0). */
export type EvidenceFieldKey =
  | "problemAnalysis"
  | "solutionProposal"
  | "aiCollaborationEvidence"
  | "iterationPlan";

export type EvidenceMapsTo = DimensionKey | "judgment-inferred";

export type TaskEvidenceField = {
  key: EvidenceFieldKey;
  label: LocalizedText;
  mapsTo: EvidenceMapsTo;
  /** Form prompt / placeholder for this evidence slot (UI). */
  prompt?: LocalizedText;
  placeholder?: LocalizedText;
};

export type DimensionWeights = Record<DimensionKey, number>;

export type ScoringCriteria = Partial<Record<DimensionKey, string>>;

/** Work materials shown on the assessment page (UI). */
export type TaskMaterialBlock = {
  title: LocalizedText;
  items: LocalizedText[];
};

/**
 * Per-task evaluation config (ANS Evaluation Architecture).
 * UI may reuse the same taskId; drives Prompt assembly + assessment presentation.
 */
export type TaskEvaluationConfig = {
  taskId: string;
  /** Market / research bucket, e.g. "product" | "engineering". */
  category?: string;
  taskName: LocalizedText;
  role: LocalizedText;
  situation: LocalizedText;
  constraints?: LocalizedText;
  /** Short goal line under situation (UI). */
  goal?: LocalizedText;
  materialsSummary?: string;
  /** Structured materials for the assessment form. */
  materialBlocks?: TaskMaterialBlock[];
  /** One-line card description on /simulate. */
  shortDescription?: LocalizedText;
  evidenceFields: TaskEvidenceField[];
  dimensionWeights: DimensionWeights;
  scoringCriteria: ScoringCriteria;
  evaluationInstructions: string;
};
