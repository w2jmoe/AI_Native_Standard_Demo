export type Locale = "en" | "zh";

export const translations = {
  en: {
    brand: "AI Native Standard",
    tagline: "Measure how you work with AI.",
    heroSubtitle:
      "Discover your AI-native work capability through a real-world AI work simulation.",
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
    earlyExperiment: "Early Experiment",
    earlyExperimentDesc:
      "Built to explore how AI-era work ability can be measured.",
    simulationLabel: "AI Work Simulation",
    assessmentTitle: "AI Product Growth Challenge",
    assessmentRole: "You are a product strategist at an AI startup.",
    assessmentTaskLabel: "Your mission",
    assessmentTask:
      "Help the team understand why users try the AI product once — and do not return.",
    assessmentStepsLabel: "You will answer",
    assessmentSteps: [
      "Problem Understanding",
      "AI Collaboration",
      "Solution",
      "Judgment",
      "Iteration",
    ],
    assessmentAiNoteLabel: "About AI tools",
    assessmentAiNote:
      "You may use any AI tools.\nWe care about how you think, judge, and collaborate — not polished AI-generated text.",
    assessmentRulesTitle: "Key guidelines",
    assessmentRulesBody:
      "Any AI tools are allowed. We focus on your thinking, judgment, and collaboration — not polished AI-generated text.",
    form: {
      problem: {
        label: "Problem Understanding",
        placeholder: "What do you believe is the core problem?",
        hint: "Think about: what is the real user problem behind low retention?",
      },
      collaboration: {
        label: "AI Collaboration",
        placeholder: "How did you use AI to help complete this task?",
        hint: "Think about: how you chose AI tools, designed collaboration, and judged AI output quality.",
      },
      solution: {
        label: "Your Solution",
        placeholder: "What is your proposed solution?",
        hint: "Think about: what is concrete, actionable, and realistic to try first.",
      },
      judgment: {
        label: "Your Judgment",
        placeholder:
          "Which parts came from AI?\nWhich key decisions did you make?\nWhat still needs validation?",
        hint: "Think about: what you kept from AI, what you decided yourself, and what still needs proof.",
      },
      iteration: {
        label: "Iteration",
        placeholder:
          "If your first solution does not work, how would you use AI and other information to improve it?",
        hint: "Think about: what feedback or data you would gather, and how AI helps you improve next.",
      },
    },
    submit: "Submit Assessment",
    submitting: "Generating profile…",
    displayNameLabel: "Display Name",
    displayNamePlaceholder: "Nickname is fine",
    displayNameHint: "Optional. Shown on your result and share card.",
    anonymousName: "Anonymous",
    backHome: "Back to Home",
    resultTitle: "Your AI Native Profile",
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
    draftRestored: "Your assessment progress has been restored.",
  },
  zh: {
    brand: "AI工作能力验证",
    tagline: "测量你与 AI 协作创造价值的能力。",
    heroSubtitle: "发现你的 AI 时代工作能力。",
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
    earlyExperiment: "早期实验",
    earlyExperimentDesc: "用于探索如何衡量 AI 时代的工作能力。",
    simulationLabel: "AI 工作模拟",
    assessmentTitle: "AI 产品增长挑战",
    assessmentRole: "你是一名 AI 创业公司的产品策略成员。",
    assessmentTaskLabel: "核心任务",
    assessmentTask:
      "帮助团队找到：为什么用户首次体验 AI 产品后没有继续使用？",
    assessmentStepsLabel: "你需要回答",
    assessmentSteps: [
      "问题理解",
      "AI 协作",
      "解决方案",
      "关键判断",
      "迭代优化",
    ],
    assessmentAiNoteLabel: "关于 AI 工具",
    assessmentAiNote:
      "你可以使用任何 AI 工具。\n我们关注：你的思考方式、判断和协作过程，而不是 AI 生成的文字。",
    assessmentRulesTitle: "关键规则",
    assessmentRulesBody:
      "可以使用任何 AI 工具。我们关注你的思考、判断与协作过程，而不是 AI 生成的文字。",
    form: {
      problem: {
        label: "问题理解",
        placeholder: "你认为核心问题是什么？",
        hint: "思考方向：留存差背后，真正的用户问题是什么？",
      },
      collaboration: {
        label: "AI协作",
        placeholder: "你如何使用AI帮助完成任务？",
        hint: "思考方向：你如何选择AI工具、设计协作方式，并判断AI输出质量。",
      },
      solution: {
        label: "你的解决方案",
        placeholder: "你的解决方案是什么？",
        hint: "思考方向：方案是否具体、可执行，以及第一步能怎么做。",
      },
      judgment: {
        label: "你的判断",
        placeholder:
          "哪些部分来自AI帮助？\n哪些关键决定由你完成？\n哪些地方需要进一步验证？",
        hint: "思考方向：哪些来自AI，哪些由你决定，还有什么需要验证。",
      },
      iteration: {
        label: "迭代优化",
        placeholder:
          "如果第一次方案效果不好，你会如何利用 AI 和其他信息继续改进？",
        hint: "思考方向：你会收集什么反馈或数据，又如何用AI继续改进。",
      },
    },
    submit: "提交评估",
    submitting: "正在生成画像…",
    displayNameLabel: "您的名称",
    displayNamePlaceholder: "可以用昵称",
    displayNameHint: "选填。会显示在结果页和分享卡片上。",
    anonymousName: "Anonymous",
    backHome: "返回首页",
    resultTitle: "你的 AI Native Profile",
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
    footerBrand: "AI 工作能力验证",
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
    draftRestored: "已恢复你的测试进度。",
  },
} as const;

export type Translation = (typeof translations)[Locale];
