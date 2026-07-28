"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  clearAssessmentDraft,
  draftToAnswers,
  loadAssessmentDraft,
  saveAssessmentDraft,
} from "@/lib/assessment/draft";
import { saveResultCache } from "@/lib/assessment/resultCache";
import { trackEvent } from "@/lib/analytics";
import { getTaskConfig, resolveTaskId } from "@/lib/tasks";
import {
  captureSourceFromUrl,
  readStoredSource,
} from "@/lib/tracking/source";
import {
  ASSESSMENT_STORAGE_KEY,
  EVALUATION_STORAGE_KEY,
  pickLocalized,
  type AssessmentAnswers,
  type EvaluationResult,
} from "@/types/assessment";

const emptyAnswers: AssessmentAnswers = {
  problemAnalysis: "",
  solutionProposal: "",
  aiCollaborationEvidence: "",
  iterationPlan: "",
};

function AssessmentFormInner() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = resolveTaskId(searchParams.get("taskId"));
  const task = useMemo(() => getTaskConfig(taskId), [taskId]);

  const [answers, setAnswers] = useState<AssessmentAnswers>(emptyAnswers);
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    captureSourceFromUrl();
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

  const fields = task.evidenceFields.map((field) => ({
    key: field.key,
    label: pickLocalized(field.label, locale),
    prompt: pickLocalized(
      field.prompt ?? { en: "", zh: "" },
      locale,
    ),
    placeholder: pickLocalized(
      field.placeholder ?? { en: "", zh: "" },
      locale,
    ),
  }));

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
    setError(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t.displayNameRequired);
      return;
    }

    setSubmitting(true);
    const source = readStoredSource();
    trackEvent("submit_assessment", {
      locale,
      taskId,
      ...(source ? { source } : {}),
    });

    const resolvedName = trimmedName;

    window.sessionStorage.setItem(
      ASSESSMENT_STORAGE_KEY,
      JSON.stringify(answers),
    );

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          locale,
          displayName: resolvedName,
          source,
          taskId,
        }),
      });

      const data = (await response.json()) as EvaluationResult & {
        error?: string;
        shareToken?: string | null;
      };

      if (!response.ok) {
        throw new Error(mapErrorMessage(data.error || t.evaluateError));
      }

      const { shareToken, error: _ignored, ...result } = data;
      const evaluation = result as EvaluationResult;

      trackEvent("evaluation_completed", {
        locale,
        score: evaluation.score,
        taskId,
      });

      clearAssessmentDraft();
      saveResultCache(
        answers,
        evaluation,
        locale,
        resolvedName,
        shareToken ?? null,
      );
      window.sessionStorage.setItem(
        EVALUATION_STORAGE_KEY,
        JSON.stringify(evaluation),
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
            {pickLocalized(task.taskName, locale)}
          </h1>
          <p className="text-[17px] font-medium leading-snug text-black/75 sm:text-[18px]">
            {pickLocalized(task.role, locale)}
          </p>
          <p className="text-[13px]">
            <Link
              href="/simulate"
              className="text-black/40 transition-colors hover:text-black/70"
            >
              {t.simulateChangeTask}
            </Link>
          </p>
        </div>

        <div className="surface-card rounded-[20px] px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
            {t.businessContextTitle}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-black/55">
            {pickLocalized(task.situation, locale)}
          </p>
          {task.goal ? (
            <>
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
                {t.businessContextGoalLabel}
              </p>
              <p className="mt-2 text-[15px] font-medium leading-relaxed text-black/75">
                {pickLocalized(task.goal, locale)}
              </p>
            </>
          ) : null}
          {task.constraints ? (
            <>
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-black/35">
                {t.constraintsTitle}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-black/55">
                {pickLocalized(task.constraints, locale)}
              </p>
            </>
          ) : null}
          <p className="mt-5 text-[13px] leading-relaxed text-black/45">
            {t.assessmentRulesBody}
          </p>
        </div>

        {task.materialBlocks && task.materialBlocks.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[18px] font-semibold tracking-tight text-black sm:text-[20px]">
                {t.workMaterialsTitle}
              </h2>
              <p className="text-[14px] leading-relaxed text-black/45">
                {t.workMaterialsIntro}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {task.materialBlocks.map((block) => (
                <div
                  key={pickLocalized(block.title, "en")}
                  className="rounded-[18px] border border-black/[0.06] bg-[color:var(--surface-muted)]/50 px-5 py-5"
                >
                  <p className="text-[13px] font-medium text-black/70">
                    {pickLocalized(block.title, locale)}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {block.items.map((item) => {
                      const text = pickLocalized(item, locale);
                      return (
                        <li
                          key={text}
                          className="flex gap-2 text-[13px] leading-relaxed text-black/55"
                        >
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--brand)]/50"
                            aria-hidden
                          />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {restored && (
          <p className="text-[13px] text-black/40">{t.draftRestored}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-10 sm:mt-14">
        <div className="space-y-2 border-b border-black/[0.06] pb-6">
          <h2 className="text-[18px] font-semibold tracking-tight text-black sm:text-[20px]">
            {t.evidenceSectionTitle}
          </h2>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-black/45">
            {t.evidenceSectionIntro}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {fields.map((field, index) => (
              <span
                key={field.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-muted)] px-3 py-1.5 text-[12px] text-black/60"
              >
                <span className="tabular-nums text-[color:var(--brand)]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {field.label}
              </span>
            ))}
          </div>
        </div>

        {fields.map((field, index) => (
          <div key={field.key} className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor={field.key}
                className="flex items-baseline gap-3 text-[15px] font-semibold text-black"
              >
                <span className="tabular-nums text-[color:var(--brand)]/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {field.label}
              </label>
              {field.prompt ? (
                <p className="whitespace-pre-line text-[14px] leading-relaxed text-black/55">
                  {field.prompt}
                </p>
              ) : null}
            </div>
            <textarea
              id={field.key}
              required
              rows={6}
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
            <span className="ml-1 text-[color:var(--brand)]">*</span>
          </label>
          <p className="text-[13px] leading-relaxed text-black/35">
            {t.displayNameHint}
          </p>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (restored) setRestored(false);
            }}
            placeholder={t.displayNamePlaceholder}
            maxLength={40}
            autoComplete="name"
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
          {submitting && (
            <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-black/45 sm:max-w-sm">
              {t.submittingHint}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export function AssessmentForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] max-w-2xl items-center justify-center px-5">
          <p className="text-[14px] text-black/40">…</p>
        </div>
      }
    >
      <AssessmentFormInner />
    </Suspense>
  );
}
