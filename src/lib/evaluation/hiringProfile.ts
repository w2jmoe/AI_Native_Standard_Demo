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

export type AiWorkFitSignal = {
  strength: HiringSignalStrength;
  strengthLabel: string;
  coreJudgment: string;
  workValue: string;
  nextValidation: string;
};

function dimLabel(key: DimensionKey, locale: "en" | "zh"): string {
  return locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en;
}

function formatList(keys: DimensionKey[], locale: "en" | "zh"): string {
  return keys
    .map((key) => dimLabel(key, locale))
    .join(locale === "zh" ? "、" : ", ");
}

/**
 * Recruiter-facing AI work-fit signal from existing evaluation fields.
 * No job titles — only capability, environment fit, and next validation.
 */
export function buildAiWorkFitSignal(
  result: EvaluationResult,
  locale: "en" | "zh",
): AiWorkFitSignal {
  const strength = getSignalStrength(result.score);
  const tops = topDimensionKeys(result, 2);
  const weak = weakDimensions(result);
  const topList = formatList(tops, locale);
  const weakList = formatList(weak, locale);
  const growth = pickLocalized(result.growthOpportunity, locale).trim();
  const hiringText = pickLocalized(result.hiringSignal, locale).trim();
  const strengthText = pickLocalized(result.strength, locale).trim();

  const strengthLabel =
    locale === "zh"
      ? signalLabels(strength).zh
      : signalLabels(strength).en;

  let coreJudgment: string;
  let workValue: string;
  let nextValidation: string;

  if (locale === "zh") {
    if (strength === "strong") {
      coreJudgment = `具备较强的 ${topList} 能力`;
      workValue =
        "能够利用 AI 快速分析问题、形成判断并推进验证，适合需要高自主探索与 AI 协作的工作环境。";
    } else if (strength === "moderate") {
      coreJudgment = `已展现一定的 ${topList} 能力，整体仍在形成稳定 AI 工作流`;
      workValue =
        "能在 AI 辅助下推进分析与方案，但关键判断与落地闭环仍需在真实协作中继续观察。";
    } else {
      coreJudgment = `AI 工作证据尚不充分，当前更偏探索阶段`;
      workValue =
        "已开始尝试与 AI 协作，但在问题拆解、独立判断或持续推进上的信号仍偏弱，暂不宜作为强适配结论。";
    }

    if (strengthText) {
      coreJudgment = `${coreJudgment}。${strengthText}`;
    } else if (hiringText) {
      coreJudgment = `${coreJudgment}。${hiringText}`;
    }

    nextValidation = weakList
      ? `建议结合真实项目经历，进一步验证 ${weakList}${growth ? `；同时关注：${growth}` : "。"}`
      : growth
        ? `建议结合真实项目经历进一步验证：${growth}`
        : "建议结合真实项目经历，进一步验证长期执行与团队协作中的 AI 工作表现。";
  } else {
    if (strength === "strong") {
      coreJudgment = `Shows relatively strong ${topList} in AI-native work`;
      workValue =
        "Can use AI to analyze problems, form judgment, and drive validation — a fit for environments that need autonomous exploration with AI.";
    } else if (strength === "moderate") {
      coreJudgment = `Shows emerging ${topList}, with an AI workflow still stabilizing`;
      workValue =
        "Can move analysis and proposals with AI support, but ownership of judgment and follow-through still needs observation in real collaboration.";
    } else {
      coreJudgment = `AI work evidence is still thin — more exploration than proven capability`;
      workValue =
        "Starting to collaborate with AI, but signals on problem framing, independent judgment, or sustained follow-through remain weak for a strong fit conclusion.";
    }

    if (strengthText) {
      coreJudgment = `${coreJudgment}. ${strengthText}`;
    } else if (hiringText) {
      coreJudgment = `${coreJudgment}. ${hiringText}`;
    }

    nextValidation = weakList
      ? `Validate further in real project work: ${weakList}${growth ? `; also watch: ${growth}` : "."}`
      : growth
        ? `Validate further in real project work: ${growth}`
        : "Validate further in real project work — especially sustained execution and how they collaborate with others while using AI.";
  }

  return {
    strength,
    strengthLabel,
    coreJudgment,
    workValue,
    nextValidation,
  };
}

export type ValidationAreaItem = {
  key: DimensionKey;
  label: string;
  score: number;
  note: string;
};

export type StrongAreaItem = {
  key: DimensionKey;
  label: string;
  score: number;
  note: string;
};

const STRONG_NOTES: Record<DimensionKey, { en: string; zh: string }> = {
  problemFraming: {
    en: "Clearer evidence of defining the real problem before jumping to solutions — a useful AI-native working habit.",
    zh: "工作证据更清晰地体现：先界定真实问题，再进入方案——这是可观察的 AI Native 工作习惯。",
  },
  aiCollaboration: {
    en: "Clearer evidence of using AI to amplify analysis while keeping direction and ownership.",
    zh: "工作证据更清晰地体现：用 AI 放大分析效率，同时仍保有方向与主导权。",
  },
  judgment: {
    en: "Clearer evidence of owning trade-offs and deciding what to keep, discard, or challenge from AI output.",
    zh: "工作证据更清晰地体现：能对 AI 输出做取舍，并承担关键判断。",
  },
  execution: {
    en: "Clearer evidence of turning insight into a concrete first-stage plan that can be acted on.",
    zh: "工作证据更清晰地体现：能把洞察落成可推进的第一阶段行动方案。",
  },
  iteration: {
    en: "Clearer evidence of thinking beyond the first plan — what to measure and how to adjust next.",
    zh: "工作证据更清晰地体现：不只给一版方案，还能想到如何衡量与继续调整。",
  },
};

const VALIDATION_NOTES: Record<
  DimensionKey,
  { en: string; zh: string }
> = {
  problemFraming: {
    en: "Problem framing appeared in the submission; further validate how the candidate reframes messy, conflicting inputs under real constraints.",
    zh: "问题定义已有体现，建议进一步验证在信息冲突或约束更复杂时如何重新框定问题。",
  },
  aiCollaboration: {
    en: "AI collaboration was visible; further validate how tool choice, prompting, and quality checks hold up across longer work loops.",
    zh: "AI 协作已有体现，建议进一步验证在更长工作周期中如何选择工具、组织协作并校验 AI 输出。",
  },
  judgment: {
    en: "Key judgment was present; further validate decision-making under competing trade-offs and incomplete information.",
    zh: "关键判断已有体现，建议进一步验证复杂约束与信息不完整时的决策过程。",
  },
  execution: {
    en: "An actionable plan was sketched; further validate how the first steps are owned, sequenced, and delivered in practice.",
    zh: "已提出可执行方向，建议进一步验证第一步行动的拆解、推进与落地闭环。",
  },
  iteration: {
    en: "A validation approach was mentioned; further validate the path after a miss — metrics, learning loops, and data-driven adjustment.",
    zh: "本次任务中提出了验证方案，但对于失败后的迭代路径和数据驱动调整过程展示较少。",
  },
};

/** Top 1–2 dimensions with why-this-matters notes (not bare scores). */
export function buildStrongAreas(
  result: EvaluationResult,
  locale: "en" | "zh",
): StrongAreaItem[] {
  const rankedDesc = [...result.dimensions]
    .map((d) => ({ key: d.name, score: d.score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const strength = pickLocalized(result.strength, locale).trim();

  return rankedDesc.map((item, index) => {
    const base = STRONG_NOTES[item.key];
    let note = locale === "zh" ? base.zh : base.en;
    if (index === 0 && strength) {
      note =
        locale === "zh"
          ? `${note} 本次表现参考：${strength}`
          : `${note} Observed in this run: ${strength}`;
    }
    return {
      key: item.key,
      label: dimLabel(item.key, locale),
      score: item.score,
      note,
    };
  });
}

/**
 * Lowest 1–2 dimensions as Validation Areas (signals to probe next — not weaknesses).
 */
export function buildValidationAreas(
  result: EvaluationResult,
  locale: "en" | "zh",
): ValidationAreaItem[] {
  const rankedAsc = [...result.dimensions]
    .map((d) => ({
      key: d.name,
      score: d.score,
    }))
    .sort((a, b) => a.score - b.score);

  const picks = rankedAsc.slice(0, 2);
  const growth = pickLocalized(result.growthOpportunity, locale).trim();

  return picks.map((item, index) => {
    const base = VALIDATION_NOTES[item.key];
    let note = locale === "zh" ? base.zh : base.en;
    if (index === 0 && growth) {
      note =
        locale === "zh"
          ? `${note} 可结合成长信号继续观察：${growth}`
          : `${note} Also useful to probe: ${growth}`;
    }
    return {
      key: item.key,
      label: dimLabel(item.key, locale),
      score: item.score,
      note,
    };
  });
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
