import { normalizeProfileId, PROFILE_LABELS } from "@/lib/evaluation/profiles";
import {
  dimensionMeta,
  resolveDisplayName,
  type AssessmentAnswers,
  type DimensionKey,
  type EvaluationResult,
  type LocalizedText,
} from "@/types/assessment";
import { getSupabaseAdmin } from "./client";

const DIMENSION_KEYS: DimensionKey[] = [
  "problemFraming",
  "aiCollaboration",
  "judgment",
  "execution",
  "iteration",
];

function dimensionScore(
  result: EvaluationResult,
  name: DimensionKey,
): number {
  return result.dimensions.find((d) => d.name === name)?.score ?? 0;
}

function toLocalized(value: unknown): LocalizedText | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const zh = String(obj.zh ?? "").trim();
  const en = String(obj.en ?? "").trim();
  if (!zh && !en) return null;
  return { zh: zh || en, en: en || zh };
}

/** Snapshot packed into judgment_answer for share-link reconstruction. */
export type JudgmentAnswerSnapshot = {
  hiringSignal: LocalizedText;
  evidenceSummary: LocalizedText;
  strength: LocalizedText;
  growthOpportunity: LocalizedText;
  profile: LocalizedText;
};

function buildJudgmentAnswerSnapshot(
  result: EvaluationResult,
): JudgmentAnswerSnapshot {
  return {
    hiringSignal: result.hiringSignal,
    evidenceSummary: result.evidenceSummary,
    strength: result.strength,
    growthOpportunity: result.growthOpportunity,
    profile: result.profile,
  };
}

export type SharedProfilePayload = {
  shareToken: string;
  displayName: string;
  locale: "en" | "zh";
  result: EvaluationResult;
};

function rebuildResultFromRow(row: {
  score: number;
  profile: string;
  problem_framing_score: number;
  ai_collaboration_score: number;
  judgment_score: number;
  execution_score: number;
  iteration_score: number;
  judgment_answer: string;
}): EvaluationResult | null {
  let snapshot: Partial<JudgmentAnswerSnapshot> = {};
  try {
    snapshot = JSON.parse(row.judgment_answer) as Partial<JudgmentAnswerSnapshot>;
  } catch {
    snapshot = {};
  }

  const profileId = normalizeProfileId(row.profile);
  const profile =
    toLocalized(snapshot.profile) ?? { ...PROFILE_LABELS[profileId] };
  const strength = toLocalized(snapshot.strength);
  const growthOpportunity = toLocalized(snapshot.growthOpportunity);
  if (!strength || !growthOpportunity) return null;

  const scoreByKey: Record<DimensionKey, number> = {
    problemFraming: row.problem_framing_score,
    aiCollaboration: row.ai_collaboration_score,
    judgment: row.judgment_score,
    execution: row.execution_score,
    iteration: row.iteration_score,
  };

  return {
    score: row.score,
    profileId,
    profile,
    dimensions: DIMENSION_KEYS.map((key) => ({
      name: key,
      score: scoreByKey[key] ?? 0,
      nameZh: dimensionMeta[key].zh,
      nameEn: dimensionMeta[key].en,
    })),
    strength,
    growthOpportunity,
    evidenceSummary: toLocalized(snapshot.evidenceSummary) ?? {
      en: "Work evidence captured across problem framing, solution, AI collaboration, and iteration.",
      zh: "已根据问题分析、方案、AI 协作与迭代计划汇总工作证据。",
    },
    hiringSignal: toLocalized(snapshot.hiringSignal) ?? {
      en: "Candidate shows emerging AI collaboration with room to strengthen independent judgment and ownership.",
      zh: "候选人展现初步 AI 协作能力，独立判断与结果负责意识仍有提升空间。",
    },
  };
}

export function isShareToken(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/**
 * Persist anonymous assessment for ANS model research.
 * Returns share token (= assessments.id) when insert succeeds.
 * Never throws — save failures must not block the user result flow.
 */
export async function saveAssessmentRecord(options: {
  answers: AssessmentAnswers;
  result: EvaluationResult;
  locale: "en" | "zh";
  displayName?: string | null;
  /** Early Experiment channel tag from ?source=; null when absent. */
  source?: string | null;
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skip save.",
    );
    return null;
  }

  const { answers, result, locale, displayName, source } = options;

  // Keep Demo 1.0 columns; map 4 Evidence → existing text columns.
  // judgment_answer packs report snapshot for /profile/{id} reconstruction.
  // share token = primary key id (no extra column).
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      locale,
      score: result.score,
      profile: result.profileId,
      display_name: resolveDisplayName(displayName),
      source: source ?? null,
      problem_framing_score: dimensionScore(result, "problemFraming"),
      ai_collaboration_score: dimensionScore(result, "aiCollaboration"),
      judgment_score: dimensionScore(result, "judgment"),
      execution_score: dimensionScore(result, "execution"),
      iteration_score: dimensionScore(result, "iteration"),
      problem_answer: answers.problemAnalysis,
      collaboration_answer: answers.aiCollaborationEvidence,
      solution_answer: answers.solutionProposal,
      judgment_answer: JSON.stringify(buildJudgmentAnswerSnapshot(result)),
      iteration_answer: answers.iterationPlan,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[supabase] Failed to save assessment:", error.message);
    return null;
  }

  const id = typeof data?.id === "string" ? data.id : null;
  return id;
}

/**
 * Load a shared profile by assessments.id (public share token).
 * Does not expose raw evidence answer text.
 */
export async function loadSharedProfile(
  shareToken: string,
): Promise<SharedProfilePayload | null> {
  if (!isShareToken(shareToken)) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("assessments")
    .select(
      [
        "id",
        "locale",
        "display_name",
        "score",
        "profile",
        "problem_framing_score",
        "ai_collaboration_score",
        "judgment_score",
        "execution_score",
        "iteration_score",
        "judgment_answer",
      ].join(","),
    )
    .eq("id", shareToken.trim())
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[supabase] Failed to load shared profile:", error.message);
    }
    return null;
  }

  const row = data as unknown as {
    id: string;
    locale: string | null;
    display_name: string | null;
    score: number;
    profile: string;
    problem_framing_score: number;
    ai_collaboration_score: number;
    judgment_score: number;
    execution_score: number;
    iteration_score: number;
    judgment_answer: string;
  };

  const result = rebuildResultFromRow(row);
  if (!result) return null;

  return {
    shareToken: String(row.id),
    displayName: resolveDisplayName(row.display_name),
    locale: row.locale === "zh" ? "zh" : "en",
    result,
  };
}
