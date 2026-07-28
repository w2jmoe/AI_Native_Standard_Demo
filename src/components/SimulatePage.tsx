"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { listTasks } from "@/lib/tasks";
import { captureSourceFromUrl } from "@/lib/tracking/source";
import { dimensionMeta, pickLocalized } from "@/types/assessment";

const DIMENSION_ORDER = [
  "problemFraming",
  "aiCollaboration",
  "judgment",
  "execution",
  "iteration",
] as const;

export function SimulatePage() {
  const { t, locale } = useLanguage();
  const [sourceQuery, setSourceQuery] = useState("");
  const tasks = useMemo(() => listTasks(), []);

  useEffect(() => {
    const source = captureSourceFromUrl();
    setSourceQuery(
      source ? `&source=${encodeURIComponent(source)}` : "",
    );
    trackEvent("page_view", {
      page: "simulate",
      ...(source ? { source } : {}),
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-black/40">
          {t.simulationLabel}
        </p>
        <h1 className="text-[30px] font-semibold tracking-tight text-black sm:text-[40px]">
          {t.simulateTitle}
        </h1>
        <p className="text-[15px] leading-relaxed text-black/55 sm:text-[16px]">
          {t.simulateIntro}
        </p>
      </div>

      <section className="mx-auto mt-10 max-w-2xl rounded-[20px] border border-black/[0.06] bg-[color:var(--surface-muted)]/50 px-5 py-5 sm:px-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
          {t.simulateDimensionsLabel}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-black/45">
          {t.simulateDimensionsIntro}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {DIMENSION_ORDER.map((key) => (
            <li
              key={key}
              className="rounded-full bg-white px-3 py-1.5 text-[12px] text-black/65 ring-1 ring-black/[0.06]"
            >
              {locale === "zh" ? dimensionMeta[key].zh : dimensionMeta[key].en}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {tasks.map((task) => {
          const href = `/assessment?taskId=${encodeURIComponent(task.taskId)}${sourceQuery}`;
          return (
            <Link
              key={task.taskId}
              href={href}
              onClick={() =>
                trackEvent("start_assessment", { taskId: task.taskId })
              }
              className="surface-card group flex flex-col rounded-[24px] px-6 py-7 transition-transform duration-200 hover:scale-[1.01] sm:px-7 sm:py-8"
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
                {t.simulateTaskLabel}
              </p>
              <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-black sm:text-[22px]">
                {pickLocalized(task.taskName, locale)}
              </h2>
              <p className="mt-3 text-[13px] font-medium text-black/55">
                <span className="text-black/35">{t.simulateRoleLabel} </span>
                {pickLocalized(task.role, locale)}
              </p>
              <p className="mt-4 flex-1 text-[14px] leading-relaxed text-black/55">
                {pickLocalized(
                  task.shortDescription ?? task.situation,
                  locale,
                )}
              </p>
              <span className="brand-button mt-8 inline-flex h-11 w-fit items-center justify-center rounded-full px-6 text-[14px] font-medium">
                {t.simulateStartTask}
              </span>
            </Link>
          );
        })}
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
