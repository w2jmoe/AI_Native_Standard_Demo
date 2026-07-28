import type { TaskEvaluationConfig } from "./types";

/**
 * Second AI Work Simulation task — AI Engineer scenario.
 * Same ANS Core five dimensions. Not a coding / LeetCode exam.
 */
export const AI_ENGINEER_V1: TaskEvaluationConfig = {
  taskId: "ai-engineer-v1",
  category: "engineering",
  taskName: {
    en: "AI Engineering Work Simulation",
    zh: "AI 工程工作模拟",
  },
  role: {
    en: "AI Engineer on an AI product team at a startup.",
    zh: "创业公司 AI 产品团队的工程师。",
  },
  situation: {
    en: "After shipping a new Agent feature, output quality drops, latency rises, and user feedback worsens. The team needs a clear diagnosis and a first-stage engineering response.",
    zh: "上线新的 Agent 功能后，输出质量下降、延迟上升、用户反馈变差。团队需要清晰诊断，以及第一阶段工程应对方案。",
  },
  constraints: {
    en: "You have limited time for a first-stage fix/mitigation plan. You may use any AI tools, but you own the diagnosis and decisions.",
    zh: "你只有有限时间给出第一阶段修复/缓解方案。可以使用任何 AI 工具，但诊断与决策必须由你负责。",
  },
  goal: {
    en: "Frame the real engineering problem, propose a first-stage plan the team can ship or try, show how you collaborate with AI, and define how you will verify and iterate.",
    zh: "框定真实工程问题，提出团队可推进的第一阶段方案，说明如何与 AI 协作，并定义如何验证与迭代。",
  },
  shortDescription: {
    en: "Diagnose an Agent quality/latency incident with AI — own judgment, ship a first-stage plan, and set a verification loop.",
    zh: "用 AI 协作诊断 Agent 质量/延迟问题：自主判断、落地第一阶段方案，并建立验证闭环。",
  },
  materialsSummary:
    "Simulated signals after Agent launch: rising p95 latency, more low-quality / off-policy outputs, negative user feedback on trust and usefulness, recent prompt/tooling/model routing changes, incomplete observability notes.",
  materialBlocks: [
    {
      title: { en: "User / Ops Signals", zh: "用户 / 运维信号" },
      items: [
        {
          en: "Users report Agent answers that sound confident but are wrong or off-policy.",
          zh: "用户反馈 Agent 回答听起来很笃定，但错误或偏离策略。",
        },
        {
          en: "Support tickets mention slow responses during peak hours.",
          zh: "高峰时段客服工单提到响应变慢。",
        },
        {
          en: "Trust and usefulness ratings fell after the Agent launch.",
          zh: "Agent 上线后，信任度与有用性评分下降。",
        },
      ],
    },
    {
      title: { en: "System / Change Notes", zh: "系统 / 变更说明" },
      items: [
        {
          en: "p95 latency increased after the new tool-calling path shipped.",
          zh: "新 tool-calling 路径上线后，p95 延迟上升。",
        },
        {
          en: "Recent changes: prompt rewrite, extra tools, and model routing experiments.",
          zh: "近期变更：prompt 重写、新增工具、模型路由实验。",
        },
        {
          en: "Observability is partial — some traces incomplete; error taxonomy is noisy.",
          zh: "可观测性不完整——部分 trace 缺失，错误分类噪声大。",
        },
        {
          en: "No single root cause is confirmed yet; product wants a first-stage mitigation within days.",
          zh: "尚无确认单一根因；产品希望几天内给出第一阶段缓解方案。",
        },
      ],
    },
  ],
  evidenceFields: [
    {
      key: "problemAnalysis",
      label: { en: "Incident Diagnosis", zh: "问题诊断" },
      mapsTo: "problemFraming",
      prompt: {
        en: "Diagnose what is going wrong.\n\nInclude:\n• Core problem (not just symptoms)\n• Judgment basis from the materials\n• Key engineering insight",
        zh: "诊断真正出了什么问题。\n\n请包含：\n• 核心问题（不只是表象）\n• 基于材料的判断依据\n• 关键工程洞察",
      },
      placeholder: {
        en: "Submit your diagnosis memo…",
        zh: "提交你的诊断备忘…",
      },
    },
    {
      key: "solutionProposal",
      label: { en: "First-Stage Engineering Plan", zh: "第一阶段工程方案" },
      mapsTo: "execution",
      prompt: {
        en: "Propose a first-stage plan the team can try.\n\nInclude:\n• Goal\n• Priority / trade-offs\n• First concrete steps (fix, mitigate, or ship)",
        zh: "提出团队可尝试的第一阶段方案。\n\n请包含：\n• 目标\n• 优先级 / 取舍\n• 可执行的第一步（修复、缓解或上线）",
      },
      placeholder: {
        en: "Submit your engineering plan…",
        zh: "提交你的工程方案…",
      },
    },
    {
      key: "aiCollaborationEvidence",
      label: { en: "AI Collaboration Notes", zh: "AI 协作记录" },
      mapsTo: "aiCollaboration",
      prompt: {
        en: "Record how you worked with AI on this incident.\n\nInclude:\n• AI tools used\n• How AI helped (debug, draft, explore)\n• Key judgments you owned (what you kept / rejected)",
        zh: "记录你在本次事件中如何与 AI 协作。\n\n请包含：\n• 使用的 AI 工具\n• AI 如何帮助你（排查、草稿、探索）\n• 你保留的关键判断（采信 / 舍弃了什么）",
      },
      placeholder: {
        en: "Record your AI collaboration process…",
        zh: "记录你的 AI 协作过程…",
      },
    },
    {
      key: "iterationPlan",
      label: { en: "Verification & Iteration", zh: "验证与迭代" },
      mapsTo: "iteration",
      prompt: {
        en: "If the first-stage plan underperforms, how will you improve?\n\nInclude:\n• Success / risk metrics\n• Feedback or signals to collect\n• How you will use AI in the next loop",
        zh: "若第一阶段方案效果不佳，你将如何改进？\n\n请包含：\n• 成功 / 风险指标\n• 要收集的反馈或信号\n• 下一轮如何继续用 AI",
      },
      placeholder: {
        en: "Submit your verification & iteration plan…",
        zh: "提交你的验证与迭代计划…",
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
      "Did the person identify a credible core problem behind Agent quality / latency / feedback decline, grounded in the materials — not a generic restatement like 'the system is unstable'?",
    aiCollaboration:
      "Did the person use AI to amplify engineering work (debugging, structuring hypotheses, drafting plans, exploring options) while remaining responsible for direction?",
    judgment:
      "Did the person show independent critical judgment?\nLook for: clear rationale for the chosen diagnosis/plan, prioritization under constraints, what they accepted/rejected from AI, ownership of risk trade-offs.\nLow Judgment if: they cannot explain why a plan was chosen, fully defer to AI recommendations, or show no prioritization.",
    execution:
      "Did they turn insight into a concrete first-stage engineering plan: core approach, priority, and first steps the team could actually try (fix, mitigate, observe)?",
    iteration:
      "If the first plan fails, do they know what metrics/signals to watch and how to use AI to improve the next engineering loop?",
  },
  evaluationInstructions: `The candidate submitted WORK EVIDENCE from an AI Engineering Work Simulation (not quiz answers, not a coding test).

Evaluate AI-era work capability through the same five ANS dimensions.

Important:
- This is NOT a LeetCode / algorithm / trivia exam. Do not reward code puzzles or buzzword dumps.
- Reward problem framing, human-owned judgment, concrete first-stage execution, credible AI collaboration, and sensible verification loops.
- Return bilingual JSON as specified (zh + en for all user-facing fields).
- Keep meanings consistent across languages.
- Keep strength/growthOpportunity concise (≤ 80 characters per language).
- Include evidenceSummary and hiringSignal.
- Score Judgment from overall evidence (no separate judgment field was submitted).`,
};
