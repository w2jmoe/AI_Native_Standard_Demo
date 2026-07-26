import { NextResponse } from "next/server";
import { evaluateWith302 } from "@/lib/evaluation/client";
import { saveAssessmentRecord } from "@/lib/supabase/saveAssessment";
import type { AssessmentAnswers } from "@/types/assessment";

function isValidAnswers(value: unknown): value is AssessmentAnswers {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.problem === "string" &&
    typeof v.collaboration === "string" &&
    typeof v.solution === "string" &&
    typeof v.judgment === "string" &&
    typeof v.iteration === "string" &&
    v.problem.trim().length > 0 &&
    v.collaboration.trim().length > 0 &&
    v.solution.trim().length > 0 &&
    v.judgment.trim().length > 0 &&
    v.iteration.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      answers?: unknown;
      locale?: string;
    };

    if (!isValidAnswers(body.answers)) {
      return NextResponse.json(
        { error: "Invalid answers. All five fields are required." },
        { status: 400 },
      );
    }

    const locale = body.locale === "zh" ? "zh" : "en";
    const result = await evaluateWith302(body.answers, locale);

    // Fire-and-forget style with await + catch: never block user result.
    try {
      await saveAssessmentRecord({
        answers: body.answers,
        result,
        locale,
      });
    } catch (saveError) {
      console.error(
        "[api/evaluate] assessment save failed:",
        saveError instanceof Error ? saveError.message : saveError,
      );
    }

    return NextResponse.json(result);
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
