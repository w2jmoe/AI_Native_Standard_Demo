"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { captureSourceFromUrl } from "@/lib/tracking/source";

export function LandingPage() {
  const { t } = useLanguage();
  const [assessmentHref, setAssessmentHref] = useState("/simulate");

  useEffect(() => {
    const source = captureSourceFromUrl();
    setAssessmentHref(
      source ? `/simulate?source=${encodeURIComponent(source)}` : "/simulate",
    );
    trackEvent("page_view", {
      page: "landing",
      ...(source ? { source } : {}),
    });
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(59,130,246,0.08),transparent_55%)]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="animate-fade-up mb-6 text-[12px] font-medium uppercase tracking-[0.16em] text-black/40">
            {t.earlyExperiment}
          </p>
          <h1 className="animate-fade-up animation-delay-100 text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-black sm:text-[64px]">
            {t.brand}
          </h1>
          <p className="animate-fade-up animation-delay-200 mt-5 max-w-4xl text-[15px] font-medium leading-snug tracking-[-0.01em] text-black/70 sm:text-[18px] md:text-[20px]">
            {t.tagline}
          </p>
          <div className="animate-fade-up animation-delay-300 mt-12">
            <Link
              href={assessmentHref}
              onClick={() => trackEvent("start_assessment")}
              className="brand-button inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-medium"
            >
              {t.startCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <h2 className="text-center text-[28px] font-semibold tracking-tight text-black sm:text-[36px]">
            {t.evaluateTitle}
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 sm:gap-y-12">
            {t.dimensions.map((item, index) => (
              <div key={item.title} className="space-y-3">
                <p className="text-[13px] tabular-nums text-[color:var(--brand)]/55">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[19px] font-semibold tracking-tight text-black sm:text-[20px]">
                  {item.title}
                </h3>
                <p className="max-w-sm text-[15px] leading-relaxed text-black/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06] bg-[color:var(--surface-muted)]/60">
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-black/35">
            {t.earlyExperiment}
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-black/55">
            {t.earlyExperimentDesc}
          </p>
        </div>
      </section>
    </div>
  );
}
