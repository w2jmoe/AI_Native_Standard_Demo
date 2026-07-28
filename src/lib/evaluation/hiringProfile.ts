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
  const topList = formatList(tops, locale);
  const growth = pickLocalized(result.growthOpportunity, locale).trim();
  const hiringText = pickLocalized(result.hiringSignal, locale).trim();
  const strengthText = pickLocalized(result.strength, locale).trim();
  const gapKeys = [...result.dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((d) => d.name);
  const gapList = formatList(gapKeys, locale);

  const strengthLabel =
    locale === "zh"
      ? signalLabels(strength).zh
      : signalLabels(strength).en;

  let coreJudgment: string;
  let workValue: string;
  let nextValidation: string;

  if (locale === "zh") {
    if (strength === "strong") {
      coreJudgment = `AI 时代工作能力偏强，尤其在 ${topList}`;
      workValue =
        "能用 AI 加快分析与推进，同时保留独立判断——适合高自主、强 AI 协作的工作环境。";
    } else if (strength === "moderate") {
      coreJudgment = `AI 时代工作能力中等，${topList} 相对更好`;
      workValue =
        "能在 AI 辅助下推进工作，但独立判断与闭环落地仍不够稳，暂不宜按强 AI Native 录用信号看。";
    } else {
      coreJudgment = `AI 时代工作能力偏弱，当前证据不足以支撑强录用信号`;
      workValue =
        "AI 协作与问题转化结果的证据偏薄——更像探索阶段，不宜作为简历/面试之外的强补充信号。";
    }

    if (strengthText) {
      coreJudgment = `${coreJudgment}。${strengthText}`;
    } else if (hiringText) {
      coreJudgment = `${coreJudgment}。${hiringText}`;
    }

    nextValidation = growth
      ? `相对短板在 ${gapList}。优先关注：${growth}`
      : `相对短板在 ${gapList}——这些维度得分更低，进步空间更明确。`;
  } else {
    if (strength === "strong") {
      coreJudgment = `Stronger AI-era work capability, especially in ${topList}`;
      workValue =
        "Uses AI to speed analysis and execution while keeping independent judgment — fit for high-autonomy, AI-collaborative environments.";
    } else if (strength === "moderate") {
      coreJudgment = `Moderate AI-era work capability; ${topList} relatively better`;
      workValue =
        "Can progress with AI support, but judgment ownership and follow-through are not yet strong enough for a strong AI-native hire signal.";
    } else {
      coreJudgment = `Weaker AI-era work capability — evidence is too thin for a strong hiring signal`;
      workValue =
        "Limited proof of turning problems into results with AI — more exploratory than hire-ready beyond resume/interview.";
    }

    if (strengthText) {
      coreJudgment = `${coreJudgment}. ${strengthText}`;
    } else if (hiringText) {
      coreJudgment = `${coreJudgment}. ${hiringText}`;
    }

    nextValidation = growth
      ? `Relative weak spots: ${gapList}. Focus: ${growth}`
      : `Relative weak spots: ${gapList} — these scored lower and show clearer room to improve.`;
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
    en: "Strong at defining the real problem before jumping to solutions — a clear AI-native working habit.",
    zh: "优势明显：先界定真实问题再给方案——这是清晰可辨的 AI Native 工作习惯。",
  },
  aiCollaboration: {
    en: "Uses AI to amplify analysis while keeping direction and ownership — not outsourcing judgment.",
    zh: "优势明显：用 AI 放大分析效率，同时仍主导方向与关键判断。",
  },
  judgment: {
    en: "Owns trade-offs: decides what to keep, discard, or challenge from AI output.",
    zh: "优势明显：能对 AI 输出做取舍，并承担关键判断。",
  },
  execution: {
    en: "Turns insight into a concrete first-stage plan that can be acted on.",
    zh: "优势明显：能把洞察落成可推进的第一阶段行动。",
  },
  iteration: {
    en: "Thinks beyond the first plan — what to measure and how to adjust next.",
    zh: "优势明显：不只给一版方案，还能想到如何衡量与继续调整。",
  },
};

/** Relative weak spots — all dimensions were scored; these are lower this run. */
const GROWTH_NOTES: Record<DimensionKey, { en: string; zh: string }> = {
  problemFraming: {
    en: "Weaker relative to other dimensions: problem framing is thinner — still leans surface restatement over sharp diagnosis.",
    zh: "相对短板：问题定义偏弱——仍偏表面复述，锐利诊断不足。",
  },
  aiCollaboration: {
    en: "Weaker relative to other dimensions: AI collaboration is shallow — limited evidence of using AI to amplify real work while staying in control.",
    zh: "相对短板：AI 协作偏浅——用 AI 放大真实工作、同时保持主导的证据不足。",
  },
  judgment: {
    en: "Weaker relative to other dimensions: independent judgment is softer — trade-offs and ownership of decisions need more rigor.",
    zh: "相对短板：独立判断偏弱——取舍理由与决策归属仍不够扎实。",
  },
  execution: {
    en: "Weaker relative to other dimensions: execution is less concrete — first steps, priority, and ownership need tightening.",
    zh: "相对短板：执行落地偏虚——优先级、第一步与推进归属仍需收紧。",
  },
  iteration: {
    en: "Weaker relative to other dimensions: iteration loop is thin — metrics, failure path, and data-driven adjustment are under-specified.",
    zh: "相对短板：迭代闭环偏弱——指标、失败路径与数据驱动调整写得不够。",
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
 * Lowest 1–2 dimensions as relative weak spots (all five were scored).
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
    const base = GROWTH_NOTES[item.key];
    let note = locale === "zh" ? base.zh : base.en;
    if (index === 0 && growth) {
      note =
        locale === "zh"
          ? `${note} 具体关注：${growth}`
          : `${note} Focus: ${growth}`;
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
