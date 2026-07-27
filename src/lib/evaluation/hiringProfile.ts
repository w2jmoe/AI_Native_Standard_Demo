import {
  dimensionMeta,
  pickLocalized,
  type DimensionKey,
  type EvaluationResult,
} from "@/types/assessment";

export type HiringSignalStrength =
  | "strong"
  | "moderate"
  | "needsMoreEvidence";

export type AiNativeLevel = {
  level: number;
  labelEn: string;
  labelZh: string;
};

export type CompanyHiringProfile = {
  aiNativeLevel: AiNativeLevel;
  signalStrength: HiringSignalStrength;
  signalLabelEn: string;
  signalLabelZh: string;
  recommendationEn: string;
  recommendationZh: string;
  reasonEn: string;
  reasonZh: string;
  furtherValidationEn: string;
  furtherValidationZh: string;
  evidenceHighlights: string[];
  riskSignals: string[];
};

const DIMENSION_ORDER: DimensionKey[] = [
  "problemFraming",
  "aiCollaboration",
  "judgment",
  "execution",
  "iteration",
];

const RISK_THRESHOLD = 60;
const SHOW_RISKS_IF_SCORE_BELOW = 75;

function getAiNativeLevel(score: number): AiNativeLevel {
  if (score >= 90) {
    return {
      level: 5,
      labelEn: "Advanced AI Native",
      labelZh: "高级 AI Native",
    };
  }
  if (score >= 80) {
    return {
      level: 4,
      labelEn: "Strong AI Native Worker",
      labelZh: "强 AI Native 工作者",
    };
  }
  if (score >= 65) {
    return {
      level: 3,
      labelEn: "AI Collaborative Worker",
      labelZh: "AI 协作型工作者",
    };
  }
  if (score >= 50) {
    return {
      level: 2,
      labelEn: "Emerging AI Worker",
      labelZh: "成长中的 AI 工作者",
    };
  }
  return {
    level: 1,
    labelEn: "AI Work Explorer",
    labelZh: "AI 工作探索者",
  };
}

function getSignalStrength(score: number): HiringSignalStrength {
  if (score >= 75) return "strong";
  if (score >= 60) return "moderate";
  return "needsMoreEvidence";
}

function signalLabels(strength: HiringSignalStrength): {
  en: string;
  zh: string;
} {
  switch (strength) {
    case "strong":
      return { en: "Strong Signal", zh: "强信号" };
    case "moderate":
      return { en: "Moderate Signal", zh: "中等信号" };
    default:
      return { en: "Needs More Evidence", zh: "需要更多证据" };
  }
}

function recommendation(strength: HiringSignalStrength): {
  en: string;
  zh: string;
} {
  switch (strength) {
    case "strong":
      return {
        en: "Recommend advancing to the next interview round.",
        zh: "推荐进入下一轮面试。",
      };
    case "moderate":
      return {
        en: "Consider for the next round with focused validation.",
        zh: "可考虑进入下一轮，并做针对性验证。",
      };
    default:
      return {
        en: "Gather more work evidence before advancing.",
        zh: "建议先补充更多工作证据，再决定是否推进。",
      };
  }
}

function topDimensionKeys(
  result: EvaluationResult,
  count = 3,
): DimensionKey[] {
  return [...result.dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((d) => d.name);
}

function weakDimensions(result: EvaluationResult): DimensionKey[] {
  return DIMENSION_ORDER.filter((key) => {
    const score = result.dimensions.find((d) => d.name === key)?.score ?? 0;
    return score < RISK_THRESHOLD;
  });
}

function buildEvidenceHighlights(
  result: EvaluationResult,
  locale: "en" | "zh",
): string[] {
  const summary = pickLocalized(result.evidenceSummary, locale).trim();
  const tops = topDimensionKeys(result, 3);
  const behaviorLines = tops.map((key) => {
    const score = result.dimensions.find((d) => d.name === key)?.score ?? 0;
    if (locale === "zh") {
      return `${dimensionMeta[key].zh}：工作证据较清晰（${score}）`;
    }
    return `${dimensionMeta[key].en}: clearer work evidence observed (${score})`;
  });

  if (summary) {
    return [summary, ...behaviorLines];
  }
  return behaviorLines;
}

function buildRiskSignals(
  result: EvaluationResult,
  locale: "en" | "zh",
): string[] {
  const weak = weakDimensions(result);
  if (result.score >= SHOW_RISKS_IF_SCORE_BELOW && weak.length === 0) {
    return [];
  }

  const risks: string[] = [];
  for (const key of weak) {
    if (locale === "zh") {
      risks.push(
        `${dimensionMeta[key].zh}证据偏弱，建议进一步验证相关落地能力。`,
      );
    } else {
      risks.push(
        `${dimensionMeta[key].en} evidence is thinner — validate practical depth further.`,
      );
    }
  }

  const growth = pickLocalized(result.growthOpportunity, locale).trim();
  if (growth && (result.score < SHOW_RISKS_IF_SCORE_BELOW || weak.length > 0)) {
    risks.push(growth);
  }

  return [...new Set(risks)];
}

/**
 * Build hiring-facing Company View content from existing evaluation output.
 * Does not change scoring — maps score/dimensions into recruiter language.
 */
export function buildCompanyHiringProfile(
  result: EvaluationResult,
  locale: "en" | "zh",
): CompanyHiringProfile {
  const aiNativeLevel = getAiNativeLevel(result.score);
  const signalStrength = getSignalStrength(result.score);
  const signal = signalLabels(signalStrength);
  const rec = recommendation(signalStrength);

  const topNames = topDimensionKeys(result, 3)
    .map((key) =>
      locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en,
    )
    .join(locale === "zh" ? "、" : ", ");

  const strength = pickLocalized(result.strength, locale).trim();
  const hiringSignalText = pickLocalized(result.hiringSignal, locale).trim();

  const reasonZh =
    hiringSignalText ||
    (strength
      ? `候选人在 AI 工作环境中展现出${topNames}等相关能力。${strength}`
      : `候选人在 AI 工作环境中展现出${topNames}等相关能力。`);

  const reasonEn =
    hiringSignalText ||
    (strength
      ? `Candidate shows relative strength in ${topNames} within an AI work setting. ${strength}`
      : `Candidate shows relative strength in ${topNames} within an AI work setting.`);

  const weak = weakDimensions(result);
  const weakNames = weak
    .map((key) =>
      locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en,
    )
    .join(locale === "zh" ? "、" : ", ");
  const growth = pickLocalized(result.growthOpportunity, locale).trim();

  const furtherValidationZh = weakNames
    ? `建议进一步验证：${weakNames}${growth ? `。${growth}` : "。"}`
    : growth || "建议结合实际项目进一步验证执行与协作表现。";

  const furtherValidationEn = weakNames
    ? `Further validate: ${weakNames}${growth ? `. ${growth}` : "."}`
    : growth ||
      "Validate execution and collaboration further through real project work.";

  return {
    aiNativeLevel,
    signalStrength,
    signalLabelEn: signal.en,
    signalLabelZh: signal.zh,
    recommendationEn: rec.en,
    recommendationZh: rec.zh,
    reasonEn,
    reasonZh,
    furtherValidationEn,
    furtherValidationZh,
    evidenceHighlights: buildEvidenceHighlights(result, locale),
    riskSignals: buildRiskSignals(result, locale),
  };
}
