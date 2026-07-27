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
};

export type DimensionWeights = Record<DimensionKey, number>;

export type ScoringCriteria = Partial<Record<DimensionKey, string>>;

/**
 * Per-task evaluation config (ANS Evaluation Architecture).
 * UI may reuse the same taskId; Phase 1 drives Prompt assembly.
 */
export type TaskEvaluationConfig = {
  taskId: string;
  taskName: LocalizedText;
  role: LocalizedText;
  situation: LocalizedText;
  constraints?: LocalizedText;
  materialsSummary?: string;
  evidenceFields: TaskEvidenceField[];
  dimensionWeights: DimensionWeights;
  scoringCriteria: ScoringCriteria;
  evaluationInstructions: string;
};
