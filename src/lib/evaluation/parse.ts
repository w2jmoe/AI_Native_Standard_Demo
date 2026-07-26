import { normalizeProfileId, PROFILE_LABELS } from "./profiles";
import {
  dimensionMeta,
  type DimensionKey,
  type EvaluationDimension,
  type EvaluationResult,
  type LocalizedText,
} from "@/types/assessment";

const DIMENSION_KEYS: DimensionKey[] = [
  "problemFraming",
  "aiCollaboration",
  "judgment",
  "execution",
  "iteration",
];

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clipText(value: string, max = 80): string {
  const trimmed = value.trim();
  if ([...trimmed].length <= max) return trimmed;
  return [...trimmed].slice(0, max).join("").trim();
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response did not contain JSON.");
    }
    return JSON.parse(match[0]);
  }
}

function toLocalized(value: unknown, max = 80): LocalizedText | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const zh = clipText(String(obj.zh ?? ""), max);
    const en = clipText(String(obj.en ?? ""), max);
    if (zh && en) return { zh, en };
    if (zh || en) return { zh: zh || en, en: en || zh };
  }

  if (typeof value === "string") {
    const text = clipText(value, max);
    if (!text) return null;
    // Legacy single-language cache: mirror into both fields.
    return { zh: text, en: text };
  }

  return null;
}

function resolveDimensionKey(raw: unknown): DimensionKey | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  const aliases: Record<string, DimensionKey> = {
    problemframing: "problemFraming",
    aicollaboration: "aiCollaboration",
    judgment: "judgment",
    execution: "execution",
    iteration: "iteration",
    问题定义: "problemFraming",
    问题定义能力: "problemFraming",
    问题框定: "problemFraming",
    问题框定能力: "problemFraming",
    ai协作: "aiCollaboration",
    ai协作能力: "aiCollaboration",
    判断: "judgment",
    判断能力: "judgment",
    执行交付: "execution",
    执行交付能力: "execution",
    迭代优化: "iteration",
    迭代优化能力: "iteration",
  };

  return aliases[value] ?? null;
}

function parseDimensions(raw: unknown): EvaluationDimension[] {
  const byKey = new Map<DimensionKey, number>();

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const key =
        resolveDimensionKey(row.name) ||
        resolveDimensionKey(row.nameEn) ||
        resolveDimensionKey(row.nameZh);
      if (!key) continue;
      byKey.set(key, clampScore(row.score));
    }
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of DIMENSION_KEYS) {
      if (key in obj) byKey.set(key, clampScore(obj[key]));
    }
  }

  return DIMENSION_KEYS.map((key) => ({
    name: key,
    score: byKey.get(key) ?? 0,
    nameZh: dimensionMeta[key].zh,
    nameEn: dimensionMeta[key].en,
  }));
}

function parseProfile(raw: unknown): {
  profileId: string;
  profile: LocalizedText;
} {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const enRaw = String(obj.en ?? "").trim();
    const zhRaw = String(obj.zh ?? "").trim();
    const profileId = normalizeProfileId(enRaw || zhRaw);
    const fallback = PROFILE_LABELS[profileId];
    return {
      profileId,
      profile: {
        en: enRaw || fallback.en,
        zh: zhRaw || fallback.zh,
      },
    };
  }

  const profileId = normalizeProfileId(String(raw ?? ""));
  return {
    profileId,
    profile: { ...PROFILE_LABELS[profileId] },
  };
}

export function parseEvaluationResult(raw: string): EvaluationResult {
  const data = extractJson(raw) as Record<string, unknown>;
  const { profileId, profile } = parseProfile(data.profile);
  const strength = toLocalized(data.strength);
  const growthOpportunity = toLocalized(
    data.growthOpportunity ?? data.growth,
  );

  if (!strength || !growthOpportunity) {
    throw new Error("Evaluation JSON missing strength or growthOpportunity.");
  }

  // Prefer LLM-provided dimension labels when present in array form.
  let dimensions = parseDimensions(data.dimensions);
  if (Array.isArray(data.dimensions)) {
    dimensions = dimensions.map((dim) => {
      const match = (data.dimensions as Array<Record<string, unknown>>).find(
        (item) => resolveDimensionKey(item?.name) === dim.name,
      );
      if (!match) return dim;
      return {
        ...dim,
        nameZh: String(match.nameZh ?? dim.nameZh).trim() || dim.nameZh,
        nameEn: String(match.nameEn ?? dim.nameEn).trim() || dim.nameEn,
      };
    });
  }

  return {
    score: clampScore(data.score),
    profileId,
    profile,
    dimensions,
    strength,
    growthOpportunity,
  };
}

/** Normalize possibly-legacy cached results into bilingual shape. */
export function normalizeCachedResult(raw: unknown): EvaluationResult | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  if (typeof data.score !== "number") return null;

  try {
    // Already bilingual
    if (
      data.profile &&
      typeof data.profile === "object" &&
      data.strength &&
      typeof data.strength === "object" &&
      Array.isArray(data.dimensions)
    ) {
      return parseEvaluationResult(JSON.stringify(data));
    }

    // Legacy flat format
    const { profileId, profile } = parseProfile(data.profile);
    const strength = toLocalized(data.strength);
    const growthOpportunity = toLocalized(
      data.growthOpportunity ?? data.growth,
    );
    if (!strength || !growthOpportunity) return null;

    return {
      score: clampScore(data.score),
      profileId,
      profile,
      dimensions: parseDimensions(data.dimensions),
      strength,
      growthOpportunity,
    };
  } catch {
    return null;
  }
}
