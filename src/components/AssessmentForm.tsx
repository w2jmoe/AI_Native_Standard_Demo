"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  clearAssessmentDraft,
  draftToAnswers,
  loadAssessmentDraft,
  saveAssessmentDraft,
} from "@/lib/assessment/draft";
import { saveResultCache } from "@/lib/assessment/resultCache";
import { trackEvent } from "@/lib/analytics";
import {
  ASSESSMENT_STORAGE_KEY,
  EVALUATION_STORAGE_KEY,
  resolveDisplayName,
  type AssessmentAnswers,
  type EvaluationResult,
} from "@/types/assessment";

const emptyAnswers: AssessmentAnswers = {
  problem: "",
  collaboration: "",
  solution: "",
  judgment: "",
  iteration: "",
};

export function AssessmentForm() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [answers, setAnswers] = useState<AssessmentAnswers>(emptyAnswers);
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = loadAssessmentDraft();
    if (draft) {
      setAnswers(draftToAnswers(draft));
      setDisplayName(draft.displayName ?? "");
      setRestored(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAssessmentDraft(answers, displayName);
  }, [answers, displayName, hydrated]);

  const fields: {
    key: keyof AssessmentAnswers;
    label: string;
    placeholder: string;
    hint: string;
  }[] = [
    {
      key: "problem",
      label: t.form.problem.label,
      placeholder: t.form.problem.placeholder,
      hint: t.form.problem.hint,
    },
    {
      key: "collaboration",
      label: t.form.collaboration.label,
      placeholder: t.form.collaboration.placeholder,
      hint: t.form.collaboration.hint,
    },
    {
      key: "solution",
      label: t.form.solution.label,
      placeholder: t.form.solution.placeholder,
      hint: t.form.solution.hint,
    },
    {
      key: "judgment",
      label: t.form.judgment.label,
      placeholder: t.form.judgment.placeholder,
      hint: t.form.judgment.hint,
    },
    {
      key: "iteration",
      label: t.form.iteration.label,
      placeholder: t.form.iteration.placeholder,
      hint: t.form.iteration.hint,
    },
  ];

  function updateField(key: keyof AssessmentAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (restored) setRestored(false);
  }

  function mapErrorMessage(raw: string) {
    if (
      raw === "AI evaluation service unavailable" ||
      raw.toLowerCase().includes("fetch failed")
    ) {
      return t.evaluateUnavailable;
    }
    return raw || t.evaluateError;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    trackEvent("submit_assessment", { locale });

    const resolvedName = resolveDisplayName(displayName);

    window.sessionStorage.setItem(
      ASSESSMENT_STORAGE_KEY,
      JSON.stringify(answers),
    );

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, locale }),
      });

      const data = (await response.json()) as EvaluationResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(mapErrorMessage(data.error || t.evaluateError));
      }

      trackEvent("evaluation_completed", {
        locale,
        score: data.score,
      });

      clearAssessmentDraft();
      saveResultCache(answers, data, locale, resolvedName);
      window.sessionStorage.setItem(
        EVALUATION_STORAGE_KEY,
        JSON.stringify(data),
      );
      router.push("/result");
    } catch (err) {
      const message =
        err instanceof Error
          ? mapErrorMessage(err.message)
          : t.evaluateError;
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-black/40">
            {t.simulationLabel}
          </p>
          <h1 className="text-[30px] font-semibold tracking-tight text-black sm:text-[40px]">
            {t.assessmentTitle}
          </h1>
          <p className="text-[17px] font-medium leading-snug text-black/75 sm:text-[18px]">
            {t.assessmentTask}
          </p>
        </div>

        <div className="surface-card rounded-[20px] px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
            {t.assessmentRulesTitle}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-black/55">
            {t.assessmentRole}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-black/45">
            {t.assessmentRulesBody}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {t.assessmentSteps.map((step, index) => (
              <span
                key={step}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-muted)] px-3 py-1.5 text-[12px] text-black/60"
              >
                <span className="tabular-nums text-[color:var(--brand)]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </span>
            ))}
          </div>
        </div>

        {restored && (
          <p className="text-[13px] text-black/40">{t.draftRestored}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-10 sm:mt-14">
        {fields.map((field, index) => (
          <div key={field.key} className="space-y-3">
            <label
              htmlFor={field.key}
              className="flex items-baseline gap-3 text-[15px] font-medium text-black"
            >
              <span className="tabular-nums text-[color:var(--brand)]/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              {field.label}
            </label>
            <p className="text-[13px] leading-relaxed text-black/35">
              {field.hint}
            </p>
            <textarea
              id={field.key}
              required
              rows={5}
              value={answers[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full resize-y rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-black outline-none transition-shadow placeholder:text-black/30 focus:border-[color:var(--brand)]/35 focus:shadow-[0_0_0_3px_var(--brand-glow)]"
            />
          </div>
        ))}

        <div className="space-y-3 border-t border-black/[0.06] pt-8">
          <label
            htmlFor="displayName"
            className="text-[15px] font-medium text-black"
          >
            {t.displayNameLabel}
          </label>
          <p className="text-[13px] leading-relaxed text-black/35">
            {t.displayNameHint}
          </p>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (restored) setRestored(false);
            }}
            placeholder={t.displayNamePlaceholder}
            maxLength={40}
            className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-black outline-none transition-shadow placeholder:text-black/30 focus:border-[color:var(--brand)]/35 focus:shadow-[0_0_0_3px_var(--brand-glow)]"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="surface-card rounded-2xl px-5 py-4 text-[14px] leading-relaxed text-black/70"
          >
            <p className="font-medium text-black">{t.evaluateErrorTitle}</p>
            <p className="mt-1.5 text-black/55">{error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="brand-button inline-flex h-12 w-full items-center justify-center rounded-full px-8 text-[15px] font-medium transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait sm:w-auto"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
