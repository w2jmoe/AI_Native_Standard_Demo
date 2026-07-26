"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { getProfileSymbol } from "./ProfileBadge";

type ShareCardProps = {
  displayName: string;
  profile: string;
  profileId: string;
  score: number;
  capability: string;
};

function buildShareText(options: {
  locale: "en" | "zh";
  displayName: string;
  profile: string;
  score: number;
  url: string;
  intro: string;
  profileLabel: string;
  scoreLabel: string;
  cta: string;
}) {
  const {
    displayName,
    profile,
    score,
    url,
    intro,
    profileLabel,
    scoreLabel,
    cta,
  } = options;

  return [
    intro,
    "",
    profileLabel,
    `${profile} | ${displayName}`,
    "",
    scoreLabel,
    `${score}/100`,
    "",
    cta,
    url,
  ].join("\n");
}

export function ShareCard({
  displayName,
  profile,
  profileId,
  score,
  capability,
}: ShareCardProps) {
  const { t, locale } = useLanguage();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleCopy() {
    const url =
      typeof window !== "undefined" ? window.location.origin : "https://";

    const text = buildShareText({
      locale,
      displayName,
      profile,
      score,
      url,
      intro: t.shareTextIntro,
      profileLabel: t.shareTextProfileLabel,
      scoreLabel: t.shareTextScoreLabel,
      cta: t.shareTextCta,
    });

    try {
      await navigator.clipboard.writeText(text);
      trackEvent("share_clicked", { locale });
      setToast(t.shareCopiedToast);
    } catch {
      setToast(t.shareCopyFailed);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md px-1">
      <p className="mb-4 text-center text-[13px] text-black/40">{t.shareTitle}</p>
      <div
        className="share-card rounded-[24px] bg-[color:var(--brand)] px-7 py-9 text-white sm:px-8 sm:py-10"
        aria-label="Shareable profile card"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium tracking-[0.06em] text-white/65">
              {t.brand}
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-[14px] ring-1 ring-white/15">
              {getProfileSymbol(profileId)}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] text-white/55">{t.shareCardLine}</p>
            <p className="flex flex-wrap items-center gap-x-3.5 text-[28px] font-semibold tracking-tight sm:gap-x-4 sm:text-[32px]">
              <span>{profile}</span>
              <span
                className="inline-block h-[0.9em] w-px shrink-0 bg-white/35"
                aria-hidden
              />
              <span className="font-medium tracking-normal text-white">
                {displayName}
              </span>
            </p>
          </div>

          <div className="border-t border-white/15 pt-5">
            <p className="text-[12px] text-white/55">{t.ansScore}</p>
            <p className="mt-1 tabular-nums text-[36px] font-semibold leading-none">
              {score}
              <span className="ml-1 text-[14px] font-normal text-white/50">
                /100
              </span>
            </p>
          </div>

          <p className="text-[14px] leading-relaxed text-white/85">
            {capability}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleCopy}
          className="brand-button inline-flex h-11 items-center justify-center rounded-full px-7 text-[14px] font-medium"
        >
          {t.copyShareText}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-max -translate-x-1/2 rounded-full bg-[#142033] px-4 py-2 text-[13px] text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
