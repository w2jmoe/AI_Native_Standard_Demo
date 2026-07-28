"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { loadResultCache } from "@/lib/assessment/resultCache";
import { normalizeCachedResult } from "@/lib/evaluation/parse";
import {
  buildAiWorkFitSignal,
  buildStrongAreas,
  buildValidationAreas,
} from "@/lib/evaluation/hiringProfile";
import {
  EVALUATION_STORAGE_KEY,
  dimensionMeta,
  pickLocalized,
  type DimensionKey,
  type EvaluationResult,
} from "@/types/assessment";
import { DimensionBar } from "./DimensionBar";
import { ExperimentFeedback } from "./ExperimentFeedback";
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

type ResultPageProps = {
  /** When set, load shared report from /api/profile/{token}. */
  shareToken?: string;
};

export function ResultPage({ shareToken: shareTokenProp }: ResultPageProps) {
  const { t, locale } = useLanguage();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [displayName, setDisplayName] = useState("Anonymous");
  const [shareToken, setShareToken] = useState<string | null>(
    shareTokenProp ?? null,
  );
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ResultView>("company");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (shareTokenProp) {
          const response = await fetch(
            `/api/profile/${encodeURIComponent(shareTokenProp)}`,
          );
          if (!response.ok) {
            if (!cancelled) setResult(null);
            return;
          }
          const data = (await response.json()) as {
            result?: unknown;
            displayName?: string;
            shareToken?: string;
          };
          const parsed = normalizeCachedResult(data.result);
          if (!cancelled) {
            setResult(parsed);
            setDisplayName(data.displayName || "Anonymous");
            setShareToken(data.shareToken || shareTokenProp);
          }
          return;
        }

        const cache = loadResultCache();
        if (cache?.result) {
          if (!cancelled) {
            setResult(cache.result);
            setDisplayName(cache.displayName);
            setShareToken(cache.shareToken ?? null);
          }
          return;
        }

        const raw = window.sessionStorage.getItem(EVALUATION_STORAGE_KEY);
        if (raw && !cancelled) {
          setResult(normalizeCachedResult(JSON.parse(raw)));
        }
      } catch {
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [shareTokenProp]);

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
          {shareTokenProp ? t.sharedProfileMissingTitle : t.noResultTitle}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-black/50">
          {shareTokenProp ? t.sharedProfileMissingDesc : t.noResultDesc}
        </p>
        <Link
          href={shareTokenProp ? "/" : "/assessment"}
          className="brand-button mt-10 inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
        >
          {shareTokenProp ? t.backHome : t.retryAssessment}
        </Link>
      </div>
    );
  }

  const profileName = pickLocalized(result.profile, locale);
  const strength = pickLocalized(result.strength, locale);
  const growth = pickLocalized(result.growthOpportunity, locale);
  const workFit = buildAiWorkFitSignal(result, locale);
  const strongAreaItems = buildStrongAreas(result, locale);
  const validationAreas = buildValidationAreas(result, locale);

  const rankedDimensions = [...result.dimensions]
    .map((d) => ({
      key: d.name,
      label:
        locale === "zh" ? dimensionMeta[d.name].zh : dimensionMeta[d.name].en,
      score: d.score,
    }))
    .sort((a, b) => b.score - a.score);

  const orderedDimensions = DIMENSION_ORDER.map((key) => {
    const found = result.dimensions.find((d) => d.name === key);
    return {
      key,
      label: locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en,
      score: found?.score ?? 0,
    };
  });

  const isPersonal = view === "personal";
  const isSharedView = Boolean(shareTokenProp);

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
          {/* One portrait zone: identity + share action (no duplicated poster) */}
          <div className="surface-card mx-auto mt-8 max-w-2xl rounded-[24px] px-6 py-8 sm:px-9 sm:py-10">
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                <ProfileBadge profileId={result.profileId} size="md" />
                <p className="text-[26px] font-semibold tracking-tight text-black sm:text-[30px]">
                  {profileName}
                </p>
              </div>
              <p className="mt-2 text-[14px] text-black/45">{displayName}</p>

              <div className="mt-6">
                <p className="text-[13px] font-medium text-black/40">
                  {t.ansScore}
                </p>
                <p className="mt-1 tabular-nums text-[44px] font-semibold tracking-tight text-[color:var(--brand)]">
                  {result.score}
                  <span className="ml-1 text-[14px] font-normal text-black/35">
                    /100
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 border-t border-black/[0.06] pt-7 text-left sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.strengthLabel}
                </p>
                <p className="text-[15px] leading-relaxed text-black/75">
                  {strength}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.growthLabel}
                </p>
                <p className="text-[15px] leading-relaxed text-black/75">
                  {growth}
                </p>
              </div>
            </div>

            {!isSharedView ? (
              <div className="mt-8 border-t border-black/[0.06] pt-6">
                <ShareCard
                  variant="cta"
                  displayName={displayName}
                  profile={profileName}
                  profileId={result.profileId}
                  score={result.score}
                  capability={strength}
                  shareToken={shareToken}
                />
              </div>
            ) : null}
          </div>

          <div className="surface-card mx-auto mt-8 max-w-2xl overflow-hidden rounded-[24px]">
            <div className="space-y-7 px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-[13px] font-medium text-black/40">
                {t.capabilityOverviewLabel}
              </p>
              {rankedDimensions.map((d) => (
                <DimensionBar key={d.key} label={d.label} score={d.score} />
              ))}
            </div>

            {!isSharedView ? (
              <div className="border-t border-black/[0.06] px-6 py-8 text-center sm:px-10">
                <Link
                  href="/assessment"
                  className="brand-button inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
                >
                  {t.retestCta}
                </Link>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Layer 1 — AI Work Fit Signal */}
          <section className="surface-card rounded-[24px] px-6 py-7 sm:px-8 sm:py-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/[0.06] pb-5">
                <div className="space-y-1">
                  <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
                    {t.candidateLabel}
                  </p>
                  <p className="text-[24px] font-semibold tracking-tight text-black sm:text-[28px]">
                    {displayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-black/35">
                    {t.ansScoreSubtle}
                  </p>
                  <p className="tabular-nums text-[28px] font-semibold tracking-tight text-[color:var(--brand)] sm:text-[32px]">
                    {result.score}
                    <span className="ml-1 text-[13px] font-normal text-black/35">
                      /100
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
                  {t.workFitSignalLabel}
                </p>
                <p className="text-[13px] text-black/40">
                  {workFit.strengthLabel}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-medium text-black/40">
                  {t.coreJudgmentLabel}
                </p>
                <p className="text-[20px] font-semibold leading-snug tracking-tight text-black sm:text-[24px]">
                  {workFit.coreJudgment}
                </p>
              </div>

              <div className="grid gap-5 border-t border-black/[0.06] pt-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.workValueLabel}
                  </p>
                  <p className="text-[14px] leading-relaxed text-black/65">
                    {workFit.workValue}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-black/40">
                    {t.nextValidationLabel}
                  </p>
                  <p className="text-[14px] leading-relaxed text-black/65">
                    {workFit.nextValidation}
                  </p>
                </div>
              </div>

              <p className="text-[12px] leading-relaxed text-black/35">
                {t.hiringDemoNote}
              </p>
            </div>
          </section>

          {/* Early Experiment feedback — high on Company View for B2B validation */}
          <ExperimentFeedback />

          {/* Capability Signals — Strong / Validation */}
          <section className="surface-card rounded-[24px] px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-[13px] font-medium text-black/40">
              {t.capabilitySignalLabel}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-black/40">
              {t.capabilitySignalIntro}
            </p>

            <div className="mt-6 space-y-4">
              <p className="text-[12px] font-medium tracking-wide text-black/35">
                {t.strongAreasLabel}
              </p>
              {strongAreaItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[16px] bg-[color:var(--surface-muted)]/70 px-4 py-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-medium text-black">
                      {item.label}
                    </p>
                    <p className="shrink-0 text-[12px] tabular-nums text-black/40">
                      {t.signalScoreLabel} {item.score}
                    </p>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-black/60">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-black/[0.06] pt-6">
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium tracking-wide text-black/35">
                  {t.validationAreasLabel}
                </p>
                <p className="text-[13px] leading-relaxed text-black/40">
                  {t.validationAreasIntro}
                </p>
              </div>
              {validationAreas.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[16px] border border-black/[0.06] bg-white px-4 py-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-medium text-black">
                      {item.label}
                    </p>
                    <p className="shrink-0 text-[12px] tabular-nums text-black/40">
                      {t.signalScoreLabel} {item.score}
                    </p>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-black/60">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed scores */}
          <section className="surface-card rounded-[24px] px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-[13px] font-medium text-black/40">
              {t.detailedScoresLabel}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-black/40">
              {t.aiWorkCapabilityIntro}
            </p>
            <div className="mt-6 space-y-6">
              {orderedDimensions.map((d) => (
                <DimensionBar key={d.key} label={d.label} score={d.score} />
              ))}
            </div>

            {!isSharedView ? (
              <div className="mt-8 border-t border-black/[0.06] pt-6 text-center sm:text-left">
                <Link
                  href="/assessment"
                  className="brand-button inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
                >
                  {t.retestCta}
                </Link>
              </div>
            ) : null}
          </section>
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
