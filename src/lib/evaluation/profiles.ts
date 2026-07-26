export type ProfileId =
  | "AI Strategist"
  | "AI Explorer"
  | "AI Operator"
  | "AI Architect"
  | "Balanced AI Native";

export const PROFILE_LABELS: Record<
  ProfileId,
  { en: string; zh: string }
> = {
  "AI Strategist": { en: "AI Strategist", zh: "AI 策略者" },
  "AI Explorer": { en: "AI Explorer", zh: "AI 探索者" },
  "AI Operator": { en: "AI Operator", zh: "AI 执行者" },
  "AI Architect": { en: "AI Architect", zh: "AI 架构者" },
  "Balanced AI Native": {
    en: "Balanced AI Native",
    zh: "平衡型 AI Native",
  },
};

const PROFILE_ALIASES: Record<string, ProfileId> = {
  "ai strategist": "AI Strategist",
  "ai explorer": "AI Explorer",
  "ai operator": "AI Operator",
  "ai architect": "AI Architect",
  "balanced ai native": "Balanced AI Native",
  "ai策略者": "AI Strategist",
  "ai 策略者": "AI Strategist",
  "ai探索者": "AI Explorer",
  "ai 探索者": "AI Explorer",
  "ai执行者": "AI Operator",
  "ai 执行者": "AI Operator",
  "ai架构者": "AI Architect",
  "ai 架构者": "AI Architect",
  "平衡型ai native": "Balanced AI Native",
  "平衡型 ai native": "Balanced AI Native",
  "平衡型ai": "Balanced AI Native",
};

export function normalizeProfileId(raw: string): ProfileId {
  const key = raw.trim().toLowerCase();
  return PROFILE_ALIASES[key] ?? "Balanced AI Native";
}

export function getProfileLabel(
  profileId: string,
  locale: "en" | "zh",
): string {
  const id = normalizeProfileId(profileId);
  return PROFILE_LABELS[id][locale];
}
