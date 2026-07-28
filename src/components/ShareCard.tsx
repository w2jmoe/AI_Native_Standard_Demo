"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { getProfileSymbol } from "./ProfileBadge";

type ShareCardProps = {
  displayName: string;
  profile: string;
  profileId: string;
  score: number;
  capability: string;
  /** assessments.id — builds /profile/{token} share URL when present. */
  shareToken?: string | null;
  /**
   * card = poster preview
   * cta = compact share row (legacy)
   * panel = result-page share block with URL + hint
   */
  variant?: "card" | "cta" | "panel";
};

function buildShareText(options: {
  displayName: string;
  profile: string;
  score: number;
  url: string;
  intro: string;
  profileLabel: string;
  scoreLabel: string;
  cta: string;
  footnote?: string;
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
    footnote,
  } = options;

  const lines = [
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
  ];

  const note = footnote?.trim();
  if (note) {
    lines.push("", note);
  }

  return lines.join("\n");
}

export function ShareCard({
  displayName,
  profile,
  profileId,
  score,
  capability,
  shareToken = null,
  variant = "card",
}: ShareCardProps) {
  const { t, locale } = useLanguage();
  const [toast, setToast] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !shareToken) return null;
    return `${window.location.origin}/profile/${shareToken}`;
  }, [shareToken]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleCopy() {
    if (!shareUrl) {
      setToast(t.sharePending);
      return;
    }

    const text = buildShareText({
      displayName,
      profile,
      score,
      url: shareUrl,
      intro: t.shareTextIntro,
      profileLabel: t.shareTextProfileLabel,
      scoreLabel: t.shareTextScoreLabel,
      cta: t.shareTextCta,
      footnote: t.shareTextFootnote,
    });

    try {
      await navigator.clipboard.writeText(text);
      trackEvent("share_clicked", { locale });
      setToast(t.shareCopiedToast);
    } catch {
      setToast(t.shareCopyFailed);
    }
  }

  async function handleCopyLinkOnly() {
    if (!shareUrl) {
      setToast(t.sharePending);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackEvent("share_clicked", { locale });
      setToast(t.shareCopiedToast);
    } catch {
      setToast(t.shareCopyFailed);
    }
  }

  if (variant === "panel" || variant === "cta") {
    return (
      <div className="relative space-y-4">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-black/40">{t.shareTitle}</p>
          <p className="text-[13px] leading-relaxed text-black/45">
            {t.shareProfileHint}
          </p>
        </div>

        {shareUrl ? (
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-black/35">
              {t.shareUrlLabel}
            </p>
            <p className="break-all rounded-[14px] border border-black/[0.08] bg-[color:var(--surface-muted)]/70 px-4 py-3 font-mono text-[12px] leading-relaxed text-black/70 sm:text-[13px]">
              {shareUrl}
            </p>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-black/50">
            {t.sharePending}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!shareUrl}
            className="brand-button inline-flex h-11 items-center justify-center rounded-full px-7 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.copyShareText}
          </button>
          {shareUrl ? (
            <button
              type="button"
              onClick={handleCopyLinkOnly}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/[0.1] bg-white px-6 text-[14px] font-medium text-black/70 transition-colors hover:border-black/[0.18] hover:text-black"
            >
              {t.copyShareLink}
            </button>
          ) : null}
        </div>

        {toast && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-[#142033] px-4 py-2 text-center text-[13px] text-white shadow-lg"
          >
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
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
          disabled={!shareUrl}
          className="brand-button inline-flex h-11 items-center justify-center rounded-full px-7 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t.copyShareText}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-[#142033] px-4 py-2 text-center text-[13px] text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
