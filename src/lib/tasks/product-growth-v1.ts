import type { TaskEvaluationConfig } from "./types";

/**
 * First AI Work Simulation task.
 * Prompt-facing strings match Demo 2.0 product-growth behavior.
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
  goal: {
    en: "Identify the real cause behind weak retention, and propose a first-stage solution the team can act on.",
    zh: "找出留存走弱背后的真实原因，并提出团队可执行的第一阶段方案。",
  },
  shortDescription: {
    en: "Work through a retention drop with AI — frame the problem, decide, ship a first plan, and iterate.",
    zh: "用 AI 协作处理留存下滑：框定问题、做判断、落地第一版方案并迭代。",
  },
  materialsSummary:
    "Simulated user feedback (unclear first experience, feature overload, weak ongoing value) and product data (high registration, weak activation, Day-7 retention below target, drop-off after onboarding).",
  materialBlocks: [
    {
      title: { en: "User Feedback", zh: "用户反馈" },
      items: [
        {
          en: "Users don't know what to do after first experience.",
          zh: "用户在首次体验后不知道下一步该做什么。",
        },
        {
          en: "Too many features create confusion.",
          zh: "功能过多造成困惑。",
        },
        {
          en: "Initial experience is interesting but lacks continuous value.",
          zh: "初始体验有趣，但缺少持续价值。",
        },
      ],
    },
    {
      title: { en: "Product Data", zh: "产品数据" },
      items: [
        {
          en: "Registration volume is high.",
          zh: "注册量高。",
        },
        {
          en: "Activation rate after first experience is weak.",
          zh: "首次体验后的激活率偏弱。",
        },
        {
          en: "Day-7 retention is below team target.",
          zh: "7 日留存低于团队目标。",
        },
        {
          en: "Behavior signals show drop-off right after onboarding.",
          zh: "行为信号显示在 onboarding 后立刻流失。",
        },
      ],
    },
  ],
  evidenceFields: [
    {
      key: "problemAnalysis",
      label: { en: "Problem Diagnosis", zh: "问题诊断" },
      mapsTo: "problemFraming",
      prompt: {
        en: "Submit your analysis of the current growth problem.\n\nInclude:\n• Core problem\n• Judgment basis\n• Key insight",
        zh: "提交你对当前增长问题的分析。\n\n请包含：\n• 核心问题\n• 判断依据\n• 关键洞察",
      },
      placeholder: {
        en: "Submit your analysis memo…",
        zh: "提交你的分析备忘…",
      },
    },
    {
      key: "solutionProposal",
      label: { en: "Growth Proposal", zh: "增长方案" },
      mapsTo: "execution",
      prompt: {
        en: "Submit a first-stage executable plan.\n\nInclude:\n• Goal\n• Priority\n• First action",
        zh: "提交第一阶段可执行方案。\n\n请包含：\n• 目标\n• 优先级\n• 第一步行动",
      },
      placeholder: {
        en: "Submit your growth proposal…",
        zh: "提交你的增长方案…",
      },
    },
    {
      key: "aiCollaborationEvidence",
      label: { en: "AI Collaboration Notes", zh: "AI 协作记录" },
      mapsTo: "aiCollaboration",
      prompt: {
        en: "Record your AI workflow.\n\nInclude:\n• AI tools used\n• How AI helped you\n• Key judgments you owned",
        zh: "记录你的 AI 协作过程。\n\n请包含：\n• 使用的 AI 工具\n• AI 如何帮助你\n• 你保留的关键判断",
      },
      placeholder: {
        en: "Record your AI collaboration process…",
        zh: "记录你的 AI 协作过程…",
      },
    },
    {
      key: "iterationPlan",
      label: { en: "Iteration Plan", zh: "迭代计划" },
      mapsTo: "iteration",
      prompt: {
        en: "If results fall short of expectations, how will you keep improving?\n\nInclude:\n• Success metrics\n• Feedback to collect\n• Next-round adjustments",
        zh: "如果结果未达预期，你将如何继续改进？\n\n请包含：\n• 成功指标\n• 要收集的反馈\n• 下一轮调整",
      },
      placeholder: {
        en: "Submit your iteration plan…",
        zh: "提交你的迭代计划…",
      },
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
- Score Judgment from overall evidence (no separate judgment field was submitted).
- This is NOT a PM exam — score AI Native work capability through evidence.`,
};
