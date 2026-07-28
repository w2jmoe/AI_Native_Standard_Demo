import { NextResponse } from "next/server";
import { evaluateWith302 } from "@/lib/evaluation/client";
import { saveAssessmentRecord } from "@/lib/supabase/saveAssessment";
import { resolveTaskId } from "@/lib/tasks";
import { normalizeSource } from "@/lib/tracking/source";
import type { AssessmentAnswers } from "@/types/assessment";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Demo 2.0 Evidence shape (preferred). */
function isEvidenceAnswers(value: unknown): value is AssessmentAnswers {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isNonEmptyString(v.problemAnalysis) &&
    isNonEmptyString(v.solutionProposal) &&
    isNonEmptyString(v.aiCollaborationEvidence) &&
    isNonEmptyString(v.iterationPlan)
  );
}

/**
 * Demo 1.0 five-field shape → map into Evidence for one release window.
 * judgment is dropped (scored from overall evidence by the prompt).
 */
function fromLegacyAnswers(value: unknown): AssessmentAnswers | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    !isNonEmptyString(v.problem) ||
    !isNonEmptyString(v.collaboration) ||
    !isNonEmptyString(v.solution) ||
    !isNonEmptyString(v.iteration)
  ) {
    return null;
  }
  return {
    problemAnalysis: v.problem.trim(),
    solutionProposal: v.solution.trim(),
    aiCollaborationEvidence: v.collaboration.trim(),
    iterationPlan: v.iteration.trim(),
  };
}

function normalizeAnswers(value: unknown): AssessmentAnswers | null {
  if (isEvidenceAnswers(value)) {
    return {
      problemAnalysis: value.problemAnalysis.trim(),
      solutionProposal: value.solutionProposal.trim(),
      aiCollaborationEvidence: value.aiCollaborationEvidence.trim(),
      iterationPlan: value.iterationPlan.trim(),
    };
  }
  return fromLegacyAnswers(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      answers?: unknown;
      locale?: string;
      displayName?: unknown;
      source?: unknown;
      /** Optional Work Simulation task; defaults to product-growth-v1. */
      taskId?: unknown;
    };

    const answers = normalizeAnswers(body.answers);
    if (!answers) {
      return NextResponse.json(
        {
          error:
            "Invalid answers. Four Evidence fields are required: problemAnalysis, solutionProposal, aiCollaborationEvidence, iterationPlan.",
        },
        { status: 400 },
      );
    }

    const locale = body.locale === "zh" ? "zh" : "en";
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required." },
        { status: 400 },
      );
    }
    const source = normalizeSource(body.source);
    const taskId = resolveTaskId(
      typeof body.taskId === "string" ? body.taskId : null,
    );
    const result = await evaluateWith302(answers, locale, taskId);

    let shareToken: string | null = null;
    // Fire-and-forget style with await + catch: never block user result.
    try {
      shareToken = await saveAssessmentRecord({
        answers,
        result,
        locale,
        displayName,
        source,
        taskId,
      });
    } catch (saveError) {
      console.error(
        "[api/evaluate] assessment save failed:",
        saveError instanceof Error ? saveError.message : saveError,
      );
    }

    // EvaluationResult shape unchanged; shareToken is additive for share links.
    return NextResponse.json({ ...result, shareToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Evaluation failed.";
    console.error("[api/evaluate]", message);

    const isUnavailable =
      message === "AI evaluation service unavailable" ||
      message.toLowerCase().includes("fetch failed");

    return NextResponse.json(
      {
        error: isUnavailable
          ? "AI evaluation service unavailable"
          : message,
      },
      { status: 500 },
    );
  }
}
