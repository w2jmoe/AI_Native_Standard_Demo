export type ScoreLevelKey =
  | "advanced"
  | "developing"
  | "emerging"
  | "explorer";

export type ScoreLevel = {
  key: ScoreLevelKey;
  labelEn: string;
  labelZh: string;
  descEn: string;
  descZh: string;
};

const LEVELS: ScoreLevel[] = [
  {
    key: "advanced",
    labelEn: "Advanced AI Native",
    labelZh: "高级 AI Native",
    descEn:
      "You already work with AI in a structured, high-leverage way. Keep refining judgment and iteration.",
    descZh: "你已经能结构化地与 AI 协作创造价值。继续打磨判断与迭代，会更稳。",
  },
  {
    key: "developing",
    labelEn: "Developing AI Native",
    labelZh: "成长型 AI Native",
    descEn:
      "You already have an AI collaboration foundation. Next, strengthen validation and iteration.",
    descZh: "你已经具备 AI 协作基础，下一步重点提升验证和迭代能力。",
  },
  {
    key: "emerging",
    labelEn: "Emerging AI Native",
    labelZh: "探索中的 AI Native",
    descEn:
      "You are building an AI work rhythm. Focus on framing problems and owning key decisions.",
    descZh: "你正在建立自己的 AI 工作节奏。先把问题定义清楚，并守住关键判断。",
  },
  {
    key: "explorer",
    labelEn: "AI Explorer",
    labelZh: "AI 探索者",
    descEn:
      "You are starting to explore AI-native work. Practice turning AI support into your own clear decisions.",
    descZh: "你正在探索 AI 时代工作方式。试着把 AI 的帮助，变成你自己的清晰判断。",
  },
];

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return LEVELS[0];
  if (score >= 75) return LEVELS[1];
  if (score >= 60) return LEVELS[2];
  return LEVELS[3];
}
