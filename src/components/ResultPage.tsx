"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { loadResultCache } from "@/lib/assessment/resultCache";
import { normalizeCachedResult } from "@/lib/evaluation/parse";
import { buildCompanyHiringProfile } from "@/lib/evaluation/hiringProfile";
import {
  EVALUATION_STORAGE_KEY,
  dimensionMeta,
  pickLocalized,
  type DimensionKey,
  type EvaluationResult,
} from "@/types/assessment";
import { DimensionBar } from "./DimensionBar";
import { ProfileBadge } from "./ProfileBadge";
import { ShareCard } from "./ShareCard";

type ResultView = "personal" | "company";

const DIMENSION_ORDER: DimensionKey[] = [
  "problemFraming",
  "aiCollaboration",
  "judgment",
  "execution",
  "iteration",
];

const SUITABLE_ROLES: Record<string, { en: string[]; zh: string[] }> = {
  "AI Strategist": {
    en: ["AI Native PM", "Product Strategy"],
    zh: ["AI Native 产品经理", "产品策略"],
  },
  "AI Explorer": {
    en: ["Associate AI PM", "Growth Associate"],
    zh: ["AI 产品助理", "增长助理"],
  },
  "AI Operator": {
    en: ["AI Product Ops", "Execution-focused PM"],
    zh: ["AI 产品运营", "执行型产品经理"],
  },
  "AI Architect": {
    en: ["AI Systems PM", "Platform PM"],
    zh: ["AI 系统产品经理", "平台产品经理"],
  },
  "Balanced AI Native": {
    en: ["AI Native PM", "Cross-functional PM"],
    zh: ["AI Native 产品经理", "跨职能产品经理"],
  },
};

function resolveRoles(profileId: string, locale: "en" | "zh"): string[] {
  const roles =
    SUITABLE_ROLES[profileId] ?? SUITABLE_ROLES["Balanced AI Native"];
  return locale === "zh" ? roles.zh : roles.en;
}

export function ResultPage() {
  const { t, locale } = useLanguage();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [displayName, setDisplayName] = useState("Anonymous");
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ResultView>("personal");

  useEffect(() => {
    try {
      const cache = loadResultCache();
      if (cache?.result) {
        setResult(cache.result);
        setDisplayName(cache.displayName);
        setReady(true);
        return;
      }

      const raw = window.sessionStorage.getItem(EVALUATION_STORAGE_KEY);
      if (raw) {
        setResult(normalizeCachedResult(JSON.parse(raw)));
      }
    } catch {
      setResult(null);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-5">
        <p className="text-[14px] text-black/40">{t.loadingResult}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-black sm:text-[36px]">
          {t.noResultTitle}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-black/50">
          {t.noResultDesc}
        </p>
        <Link
          href="/assessment"
          className="brand-button mt-10 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
        >
          {t.retryAssessment}
        </Link>
      </div>
    );
  }

  const profileName = pickLocalized(result.profile, locale);
  const strength = pickLocalized(result.strength, locale);
  const growth = pickLocalized(result.growthOpportunity, locale);
  const evidenceSummary =
    pickLocalized(result.evidenceSummary, locale) ||
    t.evidenceSummaryFallback;
  const hiringProfile = buildCompanyHiringProfile(result, locale);
  const recommendation =
    locale === "zh"
      ? hiringProfile.recommendationZh
      : hiringProfile.recommendationEn;
  const hiringReason =
    locale === "zh" ? hiringProfile.reasonZh : hiringProfile.reasonEn;

  const confidenceLabel =
    hiringProfile.signalStrength === "strong"
      ? t.confidenceHigh
      : hiringProfile.signalStrength === "moderate"
        ? t.confidenceMedium
        : t.confidenceLow;

  const suitableRoles = resolveRoles(result.profileId, locale);

  const rankedDimensions = [...result.dimensions]
    .map((d) => ({
      key: d.name,
      label:
        locale === "zh" ? dimensionMeta[d.name].zh : dimensionMeta[d.name].en,
      score: d.score,
    }))
    .sort((a, b) => b.score - a.score);

  const strongAreas = rankedDimensions.slice(0, 2);
  const developmentAreas = [...rankedDimensions].reverse().slice(0, 2);

  const keyReasons = [
    ...strongAreas.map((d) =>
      locale === "zh"
        ? `${d.label}表现突出，工作证据相对清晰`
        : `Stronger signal in ${d.label} with clearer work evidence`,
    ),
    strength,
  ].filter(Boolean);

  const orderedDimensions = DIMENSION_ORDER.map((key) => {
    const found = result.dimensions.find((d) => d.name === key);
    return {
      key,
      label: locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en,
      score: found?.score ?? 0,
    };
  });

  const capabilityLine = strength;
  const isPersonal = view === "personal";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="space-y-6 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-black sm:text-[36px]">
          {isPersonal ? t.resultTitle : t.companyResultTitle}
        </h1>

        <div
          role="tablist"
          aria-label="Result views"
          className="mx-auto inline-flex rounded-full border border-black/[0.08] bg-[color:var(--surface-muted)]/70 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isPersonal}
            onClick={() => setView("personal")}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:px-5 ${
              isPersonal
                ? "bg-white text-black shadow-sm"
                : "text-black/45 hover:text-black/70"
            }`}
          >
            {t.personalViewTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isPersonal}
            onClick={() => setView("company")}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:px-5 ${
              !isPersonal
                ? "bg-white text-black shadow-sm"
                : "text-black/45 hover:text-black/70"
            }`}
          >
            {t.companyViewTab}
          </button>
        </div>
      </div>

      {isPersonal ? (
        <>
          {/* Layer 1 — AI work capability profile */}
          <div className="surface-card mx-auto mt-8 max-w-xl rounded-[24px] px-6 py-9 text-center sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <ProfileBadge profileId={result.profileId} size="md" />
              <p className="text-[26px] font-semibold tracking-tight text-black sm:text-[32px]">
                {profileName}
              </p>
            </div>
            <p className="mt-2 text-[14px] text-black/45">{displayName}</p>
            <p className="mt-1 text-[12px] tabular-nums text-black/30">
              {t.ansScoreSubtle} {result.score}
            </p>

            <div className="mt-8 grid gap-6 text-left sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.coreStrengthLabel}
                </p>
                <p className="text-[15px] leading-relaxed text-black/75">
                  {strength}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.nextGrowthLabel}
                </p>
                <p className="text-[15px] leading-relaxed text-black/75">
                  {growth}
                </p>
              </div>
            </div>
          </div>

          {/* Layer 2 — Capability dimensions */}
          <div className="surface-card mt-6 overflow-hidden rounded-[24px]">
            <div className="space-y-7 px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-[13px] font-medium text-black/40">
                {t.capabilityOverviewLabel}
              </p>
              {rankedDimensions.map((d) => (
                <DimensionBar key={d.key} label={d.label} score={d.score} />
              ))}
            </div>

            <div className="border-t border-black/[0.06] px-6 py-8 text-center sm:px-10">
              <Link
                href="/assessment"
                className="brand-button inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
              >
                {t.retestCta}
              </Link>
            </div>
          </div>

          {/* Layer 3 — Share */}
          <div className="mt-14">
            <ShareCard
              displayName={displayName}
              profile={profileName}
              profileId={result.profileId}
              score={result.score}
              capability={capabilityLine}
            />
          </div>
        </>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Layer 1 — Hiring Decision Summary */}
          <div className="surface-card rounded-[24px] px-6 py-8 sm:px-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
              {t.hiringDecisionSummaryLabel}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-black/40">
              {t.hiringDemoNote}
            </p>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.hiringRecommendationLabel}
                </p>
                <p className="text-[22px] font-semibold tracking-tight text-black sm:text-[24px]">
                  {recommendation}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.confidenceLabel}
                  </p>
                  <p className="text-[16px] font-medium text-black/80">
                    {confidenceLabel}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.suitableRolesLabel}
                  </p>
                  <p className="text-[16px] leading-relaxed text-black/80">
                    {suitableRoles.join(locale === "zh" ? " · " : " · ")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[13px] font-medium text-black/40">
                  {t.keyReasonsLabel}
                </p>
                <ul className="space-y-2.5">
                  {keyReasons.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[15px] leading-relaxed text-black/70"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--brand)]/50"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[12px] tabular-nums text-black/30">
                {displayName} · {t.ansScoreSubtle} {result.score}
              </p>
            </div>
          </div>

          {/* Layer 2 — Capability portrait */}
          <div className="surface-card overflow-hidden rounded-[24px]">
            <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-[13px] font-medium text-black/40">
                {t.capabilityOverviewLabel}
              </p>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.strongAreasLabel}
                  </p>
                  <ul className="space-y-2">
                    {strongAreas.map((d) => (
                      <li
                        key={d.key}
                        className="text-[15px] leading-relaxed text-black/75"
                      >
                        {d.label}
                        <span className="ml-2 tabular-nums text-black/35">
                          {d.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.developmentAreasLabel}
                  </p>
                  <ul className="space-y-2">
                    {developmentAreas.map((d) => (
                      <li
                        key={d.key}
                        className="text-[15px] leading-relaxed text-black/75"
                      >
                        {d.label}
                        <span className="ml-2 tabular-nums text-black/35">
                          {d.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5 border-t border-black/[0.06] pt-8">
                <p className="text-[12px] font-medium tracking-wide text-black/30">
                  {t.detailedScoresLabel}
                </p>
                {orderedDimensions.map((d) => (
                  <DimensionBar key={d.key} label={d.label} score={d.score} />
                ))}
              </div>
            </div>
          </div>

          {/* Layer 3 — Evidence Summary */}
          <div className="surface-card rounded-[24px] px-6 py-8 sm:px-10">
            <p className="text-[13px] font-medium text-black/40">
              {t.evidenceSummaryLabel}
            </p>
            <p className="mt-2 text-[13px] text-black/40">
              {t.evidenceHighlightsIntro}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-black/75">
              {evidenceSummary}
            </p>
            {hiringReason && hiringReason !== evidenceSummary && (
              <p className="mt-4 text-[14px] leading-relaxed text-black/55">
                {hiringReason}
              </p>
            )}

            <div className="mt-8 border-t border-black/[0.06] pt-8 text-center">
              <Link
                href="/assessment"
                className="brand-button inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
              >
                {t.retestCta}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <Link
          href="/"
          className="text-[14px] text-black/45 transition-colors hover:text-black"
        >
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}
