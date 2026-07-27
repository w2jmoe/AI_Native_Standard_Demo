import type { TaskEvaluationConfig } from "./types";

/**
 * First AI Work Simulation task.
 * Prompt-facing strings match Demo 2.0 product-growth behavior (Phase 1).
 */
export const PRODUCT_GROWTH_V1: TaskEvaluationConfig = {
  taskId: "product-growth-v1",
  taskName: {
    en: "AI Product Growth Challenge",
    zh: "AI 产品增长挑战",
  },
  role: {
    en: "AI Native Product Manager at an AI startup.",
    zh: "AI 创业公司的 AI Native 产品经理。",
  },
  situation: {
    en: "The product gains many new users, but many do not continue after first experience. The team wants better activation and 7-day retention.",
    zh: "产品能获取大量新用户，但多数人在首次体验后不再继续。团队希望提升激活与 7 日留存。",
  },
  constraints: {
    en: "The team has only two weeks to validate the first-stage plan.",
    zh: "团队只有两周时间验证第一阶段方案。",
  },
  materialsSummary:
    "Simulated user feedback (unclear first experience, feature overload, weak ongoing value) and product data (high registration, weak activation, Day-7 retention below target, drop-off after onboarding).",
  evidenceFields: [
    {
      key: "problemAnalysis",
      label: { en: "Problem Analysis", zh: "问题分析" },
      mapsTo: "problemFraming",
    },
    {
      key: "solutionProposal",
      label: { en: "Solution Proposal", zh: "解决方案" },
      mapsTo: "execution",
    },
    {
      key: "aiCollaborationEvidence",
      label: { en: "AI Collaboration Evidence", zh: "AI 协作证据" },
      mapsTo: "aiCollaboration",
    },
    {
      key: "iterationPlan",
      label: { en: "Iteration Plan", zh: "迭代计划" },
      mapsTo: "iteration",
    },
  ],
  dimensionWeights: {
    problemFraming: 0.2,
    aiCollaboration: 0.2,
    judgment: 0.2,
    execution: 0.2,
    iteration: 0.2,
  },
  scoringCriteria: {
    problemFraming:
      "Did the person identify the real problem behind weak retention, with reasoning grounded in the given materials — not a generic or surface-level restatement?",
    aiCollaboration:
      "Did the person use AI to amplify their work (research, structuring, drafting, exploring options) while remaining responsible for direction?",
    judgment:
      "Did the person show independent critical judgment?\nLook for: clear rationale for choices, prioritization, what they accepted/rejected from AI, ownership of key decisions.\nLow Judgment if: they cannot explain why a plan was chosen, fully defer to AI recommendations, or show no prioritization.",
    execution:
      "Did they turn insight into a concrete first-stage plan: core approach, priority, and first execution steps that could actually be tried?",
    iteration:
      "If the first plan fails, do they know what feedback/data to collect and how to use AI to improve next?",
  },
  evaluationInstructions: `The candidate submitted WORK EVIDENCE (not quiz answers). Evaluate the quality of that evidence for AI-era work capability.

Important:
- Return bilingual JSON as specified (zh + en for all user-facing fields).
- Keep meanings consistent across languages.
- Keep strength/growthOpportunity concise (≤ 80 characters per language).
- Include evidenceSummary and hiringSignal.
- Score Judgment from overall evidence (no separate judgment field was submitted).`,
};
