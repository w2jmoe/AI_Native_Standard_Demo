export type Locale = "en" | "zh";

export const translations = {
  en: {
    brand: "AI Native Standard",
    tagline: "Evaluate how you solve real-world problems with AI.",
    heroSubtitle: "Evaluate how you solve real-world problems with AI.",
    startCta: "Start Assessment",
    evaluateTitle: "What we evaluate",
    dimensions: [
      {
        title: "Problem Framing",
        desc: "How you define the real problem before solving.",
      },
      {
        title: "AI Collaboration",
        desc: "How you partner with AI to think and create.",
      },
      {
        title: "Judgment",
        desc: "How you decide what to trust, keep, or discard.",
      },
      {
        title: "Execution",
        desc: "How you turn insight into a clear, usable outcome.",
      },
      {
        title: "Iteration",
        desc: "How you improve through feedback, data, and AI.",
      },
    ],
    earlyExperiment: "Early Experiment v1.6",
    earlyExperimentDesc:
      "Built to explore how AI-era work ability can be measured.",
    simulationLabel: "AI Work Simulation",
    assessmentTitle: "AI Product Growth Challenge",
    assessmentRole: "You are an AI Product Manager at an AI startup.",
    assessmentTaskLabel: "Your mission",
    assessmentTask:
      "Find the main reason retention drops after first experience, and design a first-stage solution.",
    businessContextTitle: "Business Context",
    businessContextBody:
      "An AI product is acquiring many new users. After first experience, most users do not continue. The team needs to lift activation and Day-7 retention.",
    businessContextGoalLabel: "Your goal",
    businessContextGoal:
      "Identify the real cause behind weak retention, and propose a first-stage solution the team can act on.",
    constraintsTitle: "Constraints",
    constraintsBody:
      "The team has only two weeks to validate the first-stage plan.",
    workMaterialsTitle: "Work Materials",
    workMaterialsIntro:
      "Use these simulated work materials the same way you would on the job.",
    userFeedbackTitle: "User Feedback",
    userFeedbackItems: [
      "Users don't know what to do after first experience.",
      "Too many features create confusion.",
      "Initial experience is interesting but lacks continuous value.",
    ],
    productDataTitle: "Product Data",
    productDataItems: [
      "Registration volume is high.",
      "Activation rate after first experience is weak.",
      "Day-7 retention is below team target.",
      "Behavior signals show drop-off right after onboarding.",
    ],
    evidenceSectionTitle: "AI Work Deliverable",
    evidenceSectionIntro:
      "You are simulating a real work task on an AI product team.\nSubmit your deliverable — show your analysis, judgment, and how you collaborate with AI.",
    assessmentStepsLabel: "Deliverable sections",
    assessmentSteps: [
      "Problem Diagnosis",
      "Growth Proposal",
      "AI Collaboration Notes",
      "Iteration Plan",
    ],
    assessmentAiNoteLabel: "About AI tools",
    assessmentAiNote:
      "You may use any AI tools.\nWe care about how you think, judge, and collaborate — not polished AI-generated text.",
    assessmentRulesTitle: "How this simulation works",
    assessmentRulesBody:
      "Any AI tools are allowed. We evaluate your work deliverable: problem framing, AI collaboration, judgment, execution, and iteration.",
    form: {
      problemAnalysis: {
        label: "Problem Diagnosis",
        prompt:
          "Submit your analysis of the current growth problem.\n\nInclude:\n• Core problem\n• Judgment basis\n• Key insight",
        placeholder: "Submit your analysis memo…",
        hint: "",
      },
      solutionProposal: {
        label: "Growth Proposal",
        prompt:
          "Submit a first-stage executable plan.\n\nInclude:\n• Goal\n• Priority\n• First action",
        placeholder: "Submit your growth proposal…",
        hint: "",
      },
      aiCollaborationEvidence: {
        label: "AI Collaboration Notes",
        prompt:
          "Record your AI workflow.\n\nInclude:\n• AI tools used\n• How AI helped you\n• Key judgments you owned",
        placeholder: "Record your AI collaboration process…",
        hint: "",
      },
      iterationPlan: {
        label: "Iteration Plan",
        prompt:
          "If results fall short of expectations, how will you keep improving?\n\nInclude:\n• Success metrics\n• Feedback to collect\n• Next-round adjustments",
        placeholder: "Submit your iteration plan…",
        hint: "",
      },
    },
    submit: "Submit Deliverable",
    submitting: "Generating profile…",
    displayNameLabel: "Display Name",
    displayNamePlaceholder: "Nickname is fine",
    displayNameHint: "Optional. Shown on your result and share card.",
    anonymousName: "Anonymous",
    backHome: "Back to Home",
    resultTitle: "Your AI Native Profile",
    personalViewTab: "Personal View",
    companyViewTab: "Company View",
    companyResultTitle: "Candidate AI Work Profile",
    hiringDecisionSummaryLabel: "Hiring Decision Summary",
    hiringDemoNote:
      "Demo AI-native work-fit signal — not a job match or final hiring decision.",
    workFitSignalLabel: "AI Work Fit Signal",
    coreJudgmentLabel: "Core judgment",
    workValueLabel: "Work value",
    nextValidationLabel: "Next validation",
    companyScoreNote:
      "Overall signal of AI-native work capability in this simulation.",
    overallScoreLabel: "Overall Score",
    capabilityOverviewLabel: "Capability Overview",
    aiWorkCapabilityLabel: "AI Work Capability",
    aiWorkCapabilityIntro:
      "How the candidate works with AI to frame problems, judge, execute, and iterate.",
    strongAreasLabel: "Strong Areas",
    developmentAreasLabel: "Development Areas",
    growthAreasLabel: "Growth Areas",
    validationAreasLabel: "Validation Areas",
    validationAreasIntro:
      "Capability signals not fully shown in this AI Work Simulation — useful to probe in a follow-up interview or work task.",
    capabilitySignalLabel: "Capability Signals",
    capabilitySignalIntro:
      "What showed up clearly in this simulation — and what still needs follow-up evidence.",
    signalScoreLabel: "Signal",
    detailedScoresLabel: "AI Work Capability Scores",
    aiNativeLevelLabel: "AI Native Level",
    confidenceLabel: "Confidence",
    suitableRolesLabel: "Work Style Signal",
    workStyleSignalLabel: "Work Style Signal",
    workStyleSignalIntro:
      "How this person tends to work with AI — a work style signal, not a job match.",
    keyReasonsLabel: "Key Reasons",
    evidenceSummaryLabel: "Evidence Summary",
    evidenceHighlightsIntro:
      "How the candidate worked in an AI environment: framing the problem, using AI, owning judgment, and driving validation.",
    riskSignalsLabel: "Risk Signals",
    hiringSignalLabel: "Hiring Signal",
    hiringSignalIntro:
      "Fit for AI-native work environments — not a specific role recommendation.",
    hiringRecommendationLabel: "Hiring Recommendation",
    hiringReasonLabel: "Reason",
    furtherValidationLabel: "Further Validation",
    workStyleLabel: "AI Native Work Style",
    evidenceSummaryFallback:
      "Work evidence captured across problem framing, solution, AI collaboration, and iteration.",
    hiringSignalFallback:
      "Candidate shows emerging AI collaboration with room to strengthen independent judgment and ownership.",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    nextGrowthLabel: "Next growth focus",
    coreStrengthLabel: "Core strength",
    ansScoreSubtle: "ANS Score",
    ansScoreReferenceLabel: "ANS Score (reference)",
    submittingHint:
      "AI is analyzing your work process and decision evidence.\nThis usually takes 15–30 seconds.",
    ansScore: "ANS Score",
    scoreLevelLabel: "Score Level",
    topStrengthLabel: "Top strength",
    profileLabel: "Your AI Native Profile",
    strengthLabel: "Strength",
    growthLabel: "Growth Opportunity",
    shareTitle: "Share your profile",
    shareCardLine: "I discovered my AI Native Profile.",
    copyShareText: "Copy Share Text",
    shareCopiedToast: "Copied. Ready to share.",
    shareCopyFailed: "Could not copy. Please try again.",
    shareTextIntro: "I discovered my AI Native profile.",
    shareTextProfileLabel: "My AI Work Profile:",
    shareTextScoreLabel: "ANS Score:",
    shareTextCta: "Discover how you work with AI:",
    continueHint: "This is a discovery profile — not a pass or fail.",
    footerNote: "AI Work Simulation 　|　 Capability discovery",
    footerBrand: "AI Native Standard",
    footerTagline:
      "Building a better way to understand AI-era work ability.",
    footerContactLabel: "Early research & collaboration:",
    evaluateErrorTitle: "Something went wrong",
    evaluateError:
      "We could not generate your profile right now. Please try again.",
    evaluateUnavailable:
      "AI evaluation service temporarily unavailable. Please try again.",
    loadingResult: "Loading your profile…",
    noResultTitle: "No profile yet",
    noResultDesc:
      "Complete the AI Work Simulation first to generate your AI Native Profile.",
    retryAssessment: "Start Assessment",
    retestCta: "Retake AI Work Simulation",
    draftRestored: "Your work draft has been restored.",
  },

  zh: {
    brand: "AI时代工作能力评估",
    tagline: "通过真实工作模拟，评估你如何使用 AI 解决问题并创造结果。",
    heroSubtitle: "通过真实工作模拟，评估你如何使用 AI 解决问题并创造结果。",
    startCta: "开始测试",
    evaluateTitle: "我们评估什么",
    dimensions: [
      {
        title: "问题定义能力",
        desc: "在动手之前，你如何定义真正的问题。",
      },
      {
        title: "AI协作能力",
        desc: "你如何把 AI 当作思考与创作伙伴。",
      },
      {
        title: "判断能力",
        desc: "你如何决定信任、保留或舍弃什么。",
      },
      {
        title: "执行交付能力",
        desc: "你如何把洞察变成清晰可用的结果。",
      },
      {
        title: "迭代优化能力",
        desc: "你如何通过反馈、数据和 AI 持续改进。",
      },
    ],
    earlyExperiment: "早期实验 v1.6",
    earlyExperimentDesc: "用于探索如何衡量 AI 时代的工作能力。",
    simulationLabel: "AI 工作模拟",
    assessmentTitle: "AI 产品增长挑战",
    assessmentRole: "你是一名 AI 创业公司的 AI 产品经理。",
    assessmentTaskLabel: "核心任务",
    assessmentTask:
      "找出用户留存下降背后的主要原因，并设计第一阶段解决方案。",
    businessContextTitle: "业务背景",
    businessContextBody:
      "一家 AI 产品拥有大量新用户。大量用户完成首次体验后没有继续使用。团队希望提升激活与 7 日留存。",
    businessContextGoalLabel: "你的目标",
    businessContextGoal:
      "找到留存走弱的真正原因，并提出团队可以立刻推进的第一阶段方案。",
    constraintsTitle: "约束条件",
    constraintsBody: "团队只有两周时间验证第一阶段方案。",
    workMaterialsTitle: "工作材料",
    workMaterialsIntro: "像真实工作一样使用这些模拟资料。",
    userFeedbackTitle: "用户反馈",
    userFeedbackItems: [
      "用户不知道首次体验后下一步该做什么。",
      "功能太多，造成困惑。",
      "第一次体验还不错，但缺少持续使用的价值。",
    ],
    productDataTitle: "产品数据",
    productDataItems: [
      "注册量较高。",
      "首次体验后的激活率偏弱。",
      "7 日留存低于团队目标。",
      "行为信号显示用户在 onboarding 后很快流失。",
    ],
    evidenceSectionTitle: "AI 工作成果交付",
    evidenceSectionIntro:
      "你正在模拟完成一次 AI 产品团队中的真实工作任务。\n请提交你的工作成果，并展示你的分析、判断以及 AI 协作方式。",
    assessmentStepsLabel: "交付模块",
    assessmentSteps: [
      "问题分析 Memo",
      "增长方案 Proposal",
      "AI 协作记录",
      "迭代计划",
    ],
    assessmentAiNoteLabel: "关于 AI 工具",
    assessmentAiNote:
      "你可以使用任何 AI 工具。\n我们关注：你的思考方式、判断和协作过程，而不是 AI 生成的文字。",
    assessmentRulesTitle: "模拟工作方式",
    assessmentRulesBody:
      "可以使用任何 AI 工具。我们评估的是工作成果：问题定义、AI 协作、判断、执行与迭代。",
    form: {
      problemAnalysis: {
        label: "问题分析 Memo",
        prompt:
          "请提交你对当前增长问题的分析判断。\n\n包含：\n· 核心问题\n· 判断依据\n· 关键洞察",
        placeholder: "提交你的分析 Memo……",
        hint: "",
      },
      solutionProposal: {
        label: "增长方案 Proposal",
        prompt:
          "请提交第一阶段可执行方案。\n\n包含：\n· 目标\n· 优先级\n· 第一行动",
        placeholder: "提交你的增长方案……",
        hint: "",
      },
      aiCollaborationEvidence: {
        label: "AI 协作记录",
        prompt:
          "记录你的 AI 工作流程。\n\n包含：\n· 使用哪些 AI 工具\n· AI 如何帮助你\n· 哪些关键判断由你完成",
        placeholder: "记录你的 AI 协作过程……",
        hint: "",
      },
      iterationPlan: {
        label: "迭代计划",
        prompt:
          "如果方案效果没有达到预期，你如何继续优化？\n\n包含：\n· 验证指标\n· 收集反馈\n· 下一轮调整",
        placeholder: "提交你的迭代计划……",
        hint: "",
      },
    },
    submit: "提交工作成果",
    submitting: "正在生成画像…",
    displayNameLabel: "您的名字",
    displayNamePlaceholder: "可以用昵称",
    displayNameHint: "选填。会显示在结果页和分享卡片上。",
    anonymousName: "Anonymous",
    backHome: "返回首页",
    resultTitle: "你的 AI Native Profile",
    personalViewTab: "个人视图",
    companyViewTab: "企业视图",
    companyResultTitle: "候选人 AI 工作画像",
    hiringDecisionSummaryLabel: "招聘决策摘要",
    hiringDemoNote:
      "Demo 阶段的 AI Native 工作适配信号——不是岗位匹配，也不构成最终录用决策。",
    workFitSignalLabel: "AI 工作适配信号",
    coreJudgmentLabel: "核心判断",
    workValueLabel: "工作价值",
    nextValidationLabel: "下一步验证",
    companyScoreNote: "本次模拟中的 AI Native 工作能力综合信号。",
    overallScoreLabel: "综合得分",
    capabilityOverviewLabel: "能力概览",
    aiWorkCapabilityLabel: "AI 工作能力",
    aiWorkCapabilityIntro:
      "候选人如何与 AI 协作：定义问题、判断、执行与迭代。",
    strongAreasLabel: "优势领域",
    developmentAreasLabel: "待提升领域",
    growthAreasLabel: "成长领域",
    validationAreasLabel: "待验证领域",
    validationAreasIntro:
      "本次 AI Work Simulation 中没有充分展示的能力信号，建议在后续面试或任务中进一步验证。",
    capabilitySignalLabel: "能力信号对照",
    capabilitySignalIntro:
      "本次模拟中已经看清的信号，以及建议继续验证的方向。",
    signalScoreLabel: "信号",
    detailedScoresLabel: "AI 工作能力详细评分",
    aiNativeLevelLabel: "AI Native Level",
    confidenceLabel: "置信度",
    suitableRolesLabel: "工作风格信号",
    workStyleSignalLabel: "工作风格信号",
    workStyleSignalIntro:
      "此人与 AI 协作的典型工作方式——是工作风格信号，不是岗位匹配。",
    keyReasonsLabel: "关键理由",
    evidenceSummaryLabel: "证据摘要",
    evidenceHighlightsIntro:
      "候选人在 AI 工作环境中的具体表现：如何定义问题、如何利用 AI、如何做关键判断、如何推进验证。",
    riskSignalsLabel: "风险信号",
    hiringSignalLabel: "招聘信号",
    hiringSignalIntro:
      "对 AI Native 工作环境的适配信号——不是具体岗位推荐。",
    hiringRecommendationLabel: "招聘建议",
    hiringReasonLabel: "理由",
    furtherValidationLabel: "建议进一步验证",
    workStyleLabel: "AI Native 工作风格",
    evidenceSummaryFallback:
      "已根据问题分析、方案、AI 协作与迭代计划汇总工作证据。",
    hiringSignalFallback:
      "候选人展现初步 AI 协作能力，独立判断与结果负责意识仍有提升空间。",
    confidenceHigh: "高",
    confidenceMedium: "中",
    confidenceLow: "低",
    nextGrowthLabel: "下一步提升方向",
    coreStrengthLabel: "核心优势",
    ansScoreSubtle: "ANS Score",
    ansScoreReferenceLabel: "ANS Score（参考）",
    submittingHint:
      "AI 正在分析你的工作过程与决策证据。\n预计需要 15–30 秒。",
    ansScore: "ANS Score",
    scoreLevelLabel: "能力水平",
    topStrengthLabel: "最高优势",
    profileLabel: "你的 AI Native Profile",
    strengthLabel: "优势",
    growthLabel: "成长机会",
    shareTitle: "分享你的画像",
    shareCardLine: "我发现了自己的 AI 工作画像。",
    copyShareText: "复制分享内容",
    shareCopiedToast: "已复制，可以分享给朋友",
    shareCopyFailed: "复制失败，请重试",
    shareTextIntro: "我完成了 AI Native 工作能力测试。",
    shareTextProfileLabel: "我的 AI 工作画像：",
    shareTextScoreLabel: "ANS 分数：",
    shareTextCta: "发现你与 AI 协作创造价值的方式：",
    continueHint: "这是一份能力发现画像——不是通过或失败。",
    footerNote: "AI 工作模拟 　|　 能力发现",
    footerBrand: "AI时代工作能力评估",
    footerTagline: "探索 AI 时代工作能力验证方式。",
    footerContactLabel: "研究交流与合作：",
    evaluateErrorTitle: "出了点问题",
    evaluateError: "暂时无法生成你的画像，请稍后再试。",
    evaluateUnavailable: "AI 评估服务暂时不可用，请稍后再试。",
    loadingResult: "正在加载画像…",
    noResultTitle: "还没有画像",
    noResultDesc: "请先完成 AI 工作模拟，才能生成你的 AI 工作画像。",
    retryAssessment: "开始测试",
    retestCta: "重新进行 AI 工作模拟",
    draftRestored: "已恢复你的工作草稿。",
  },
} as const;

export type Translation = (typeof translations)[Locale];
