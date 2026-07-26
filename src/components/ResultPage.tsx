"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { loadResultCache } from "@/lib/assessment/resultCache";
import { normalizeCachedResult } from "@/lib/evaluation/parse";
import { getScoreLevel } from "@/lib/evaluation/scoreLevel";
import {
  EVALUATION_STORAGE_KEY,
  dimensionMeta,
  pickLocalized,
  type EvaluationResult,
} from "@/types/assessment";
import { DimensionBar } from "./DimensionBar";
import { ProfileBadge } from "./ProfileBadge";
import { ShareCard } from "./ShareCard";

export function ResultPage() {
  const { t, locale } = useLanguage();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const cache = loadResultCache();
      if (cache?.result) {
        setResult(cache.result);
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
  const scoreLevel = getScoreLevel(result.score);
  const levelLabel = locale === "zh" ? scoreLevel.labelZh : scoreLevel.labelEn;
  const levelDesc = locale === "zh" ? scoreLevel.descZh : scoreLevel.descEn;

  // Display labels always come from dimensionMeta (中文：问题定义，不是 LLM 可能返回的「问题框定」).
  const dimensions = [...result.dimensions]
    .map((d) => ({
      key: d.name,
      label:
        locale === "zh" ? dimensionMeta[d.name].zh : dimensionMeta[d.name].en,
      score: d.score,
    }))
    .sort((a, b) => b.score - a.score);

  const top = dimensions[0];
  const capabilityLine = strength || levelDesc;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="space-y-8 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-black sm:text-[36px]">
          {t.resultTitle}
        </h1>

        <div className="surface-card mx-auto max-w-xl rounded-[24px] px-6 py-9 sm:px-10">
          <div className="flex items-center justify-center gap-3">
            <ProfileBadge profileId={result.profileId} size="md" />
            <p className="text-[26px] font-semibold tracking-tight text-black sm:text-[32px]">
              {profileName}
            </p>
          </div>
        </div>

        <div className="surface-card mx-auto max-w-xl rounded-[24px] px-6 py-8 sm:px-10">
          <p className="text-[13px] font-medium tracking-wide text-black/45">
            {t.ansScore}
          </p>
          <p className="mt-2 tabular-nums text-[56px] font-semibold tracking-tight text-[color:var(--brand)] sm:text-[60px]">
            {result.score}
          </p>
          <p className="mt-3 text-[18px] font-medium text-black/85">
            {levelLabel}
          </p>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-black/50">
            {levelDesc}
          </p>
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden rounded-[24px]">
        <div className="space-y-7 px-6 py-8 sm:px-10 sm:py-10">
          {top && (
            <p className="text-[13px] text-black/40">
              {t.topStrengthLabel}
              <span className="ml-2 font-medium text-[color:var(--brand)]">
                {top.label} · {top.score}
              </span>
            </p>
          )}
          {dimensions.map((d) => (
            <DimensionBar key={d.key} label={d.label} score={d.score} />
          ))}
        </div>

        <div className="grid gap-8 border-t border-black/[0.06] px-6 py-8 sm:grid-cols-2 sm:px-10">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-black/40">
              {t.strengthLabel}
            </p>
            <p className="text-[16px] leading-relaxed text-black/75">
              {strength}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-black/40">
              {t.growthLabel}
            </p>
            <p className="text-[16px] leading-relaxed text-black/75">
              {growth}
            </p>
          </div>
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

      <div className="mt-14">
        <ShareCard
          profile={profileName}
          profileId={result.profileId}
          score={result.score}
          capability={capabilityLine}
        />
      </div>

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
