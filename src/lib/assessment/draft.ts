import type { AssessmentAnswers } from "@/types/assessment";

/** localStorage draft for in-progress assessment (Demo 2.0 Evidence). */
export type AssessmentDraft = {
  status: "in_progress";
  displayName: string;
  problemAnalysis: string;
  solutionProposal: string;
  aiCollaborationEvidence: string;
  iterationPlan: string;
  updatedAt: string;
};

export const ASSESSMENT_DRAFT_KEY = "ans-assessment-draft";

export function answersToDraft(
  answers: AssessmentAnswers,
  displayName = "",
): AssessmentDraft {
  return {
    status: "in_progress",
    displayName,
    problemAnalysis: answers.problemAnalysis,
    solutionProposal: answers.solutionProposal,
    aiCollaborationEvidence: answers.aiCollaborationEvidence,
    iterationPlan: answers.iterationPlan,
    updatedAt: new Date().toISOString(),
  };
}

export function draftToAnswers(draft: AssessmentDraft): AssessmentAnswers {
  return {
    problemAnalysis: draft.problemAnalysis ?? "",
    solutionProposal: draft.solutionProposal ?? "",
    aiCollaborationEvidence: draft.aiCollaborationEvidence ?? "",
    iterationPlan: draft.iterationPlan ?? "",
  };
}

function hasContent(draft: AssessmentDraft): boolean {
  return Boolean(
    draft.displayName?.trim() ||
      draft.problemAnalysis.trim() ||
      draft.solutionProposal.trim() ||
      draft.aiCollaborationEvidence.trim() ||
      draft.iterationPlan.trim(),
  );
}

/** Map Demo 1.0 draft keys into Evidence shape when present. */
function migrateLegacyDraft(raw: Record<string, unknown>): AssessmentDraft | null {
  const problemAnalysis = String(
    raw.problemAnalysis ?? raw.problemFraming ?? "",
  );
  const solutionProposal = String(raw.solutionProposal ?? raw.solution ?? "");
  const aiCollaborationEvidence = String(
    raw.aiCollaborationEvidence ?? raw.aiCollaboration ?? "",
  );
  const iterationPlan = String(raw.iterationPlan ?? raw.iteration ?? "");

  const draft: AssessmentDraft = {
    status: "in_progress",
    displayName: String(raw.displayName ?? ""),
    problemAnalysis,
    solutionProposal,
    aiCollaborationEvidence,
    iterationPlan,
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : new Date().toISOString(),
  };

  if (!hasContent(draft)) return null;
  return draft;
}

export function loadAssessmentDraft(): AssessmentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ASSESSMENT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.status !== "in_progress") return null;
    return migrateLegacyDraft(parsed);
  } catch {
    return null;
  }
}

export function saveAssessmentDraft(
  answers: AssessmentAnswers,
  displayName = "",
): void {
  if (typeof window === "undefined") return;
  try {
    const draft = answersToDraft(answers, displayName);
    if (!hasContent(draft)) {
      window.localStorage.removeItem(ASSESSMENT_DRAFT_KEY);
      return;
    }
    window.localStorage.setItem(ASSESSMENT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearAssessmentDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ASSESSMENT_DRAFT_KEY);
  } catch {
    // Ignore.
  }
}
