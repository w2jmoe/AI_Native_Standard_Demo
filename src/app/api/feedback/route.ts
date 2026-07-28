import { NextResponse } from "next/server";
import {
  FEEDBACK_ROLES,
  HIRING_SIGNAL_VALUES,
  saveExperimentFeedback,
  type FeedbackRole,
  type HiringSignalValue,
} from "@/lib/supabase/saveExperimentFeedback";
import { normalizeSource } from "@/lib/tracking/source";

function isHiringSignalValue(value: unknown): value is HiringSignalValue {
  return (
    typeof value === "string" &&
    (HIRING_SIGNAL_VALUES as string[]).includes(value)
  );
}

function normalizeRoles(value: unknown): FeedbackRole[] | null {
  if (!Array.isArray(value)) return null;
  const roles = value.filter(
    (item): item is FeedbackRole =>
      typeof item === "string" && (FEEDBACK_ROLES as string[]).includes(item),
  );
  return roles.length > 0 ? [...new Set(roles)] : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      hiringSignalValue?: unknown;
      roles?: unknown;
      locale?: unknown;
      source?: unknown;
    };

    if (!isHiringSignalValue(body.hiringSignalValue)) {
      return NextResponse.json(
        { error: "Invalid hiringSignalValue." },
        { status: 400 },
      );
    }

    const roles = normalizeRoles(body.roles);
    if (!roles) {
      return NextResponse.json(
        { error: "Select at least one role." },
        { status: 400 },
      );
    }

    const locale = body.locale === "zh" ? "zh" : "en";
    const source = normalizeSource(body.source);

    const saved = await saveExperimentFeedback({
      hiringSignalValue: body.hiringSignalValue,
      roles,
      locale,
      source,
    });

    if (!saved.ok) {
      return NextResponse.json(
        { error: saved.error || "Failed to save feedback." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Feedback save failed.";
    console.error("[api/feedback]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
