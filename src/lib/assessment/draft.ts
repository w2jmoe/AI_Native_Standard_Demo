import type { AssessmentAnswers } from "@/types/assessment";

/** localStorage draft for in-progress assessment */
export type AssessmentDraft = {
  status: "in_progress";
  displayName: string;
  problemFraming: string;
  aiCollaboration: string;
  solution: string;
  judgment: string;
  iteration: string;
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
    problemFraming: answers.problem,
    aiCollaboration: answers.collaboration,
    solution: answers.solution,
    judgment: answers.judgment,
    iteration: answers.iteration,
    updatedAt: new Date().toISOString(),
  };
}

export function draftToAnswers(draft: AssessmentDraft): AssessmentAnswers {
  return {
    problem: draft.problemFraming ?? "",
    collaboration: draft.aiCollaboration ?? "",
    solution: draft.solution ?? "",
    judgment: draft.judgment ?? "",
    iteration: draft.iteration ?? "",
  };
}

function hasContent(draft: AssessmentDraft): boolean {
  return Boolean(
    draft.displayName?.trim() ||
      draft.problemFraming.trim() ||
      draft.aiCollaboration.trim() ||
      draft.solution.trim() ||
      draft.judgment.trim() ||
      draft.iteration.trim(),
  );
}

export function loadAssessmentDraft(): AssessmentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ASSESSMENT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentDraft;
    if (parsed.status !== "in_progress") return null;
    if (!hasContent(parsed)) return null;
    return {
      ...parsed,
      displayName: parsed.displayName ?? "",
    };
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
