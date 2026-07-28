"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  FEEDBACK_ROLES,
  HIRING_SIGNAL_VALUES,
  type FeedbackRole,
  type HiringSignalValue,
} from "@/lib/supabase/saveExperimentFeedback";
import { readStoredSource } from "@/lib/tracking/source";

/**
 * Company View only — Founder / Hiring Manager Early Experiment feedback.
 * Optional; does not block the main result flow.
 */
export function ExperimentFeedback() {
  const { t, locale } = useLanguage();
  const [hiringSignal, setHiringSignal] = useState<HiringSignalValue | null>(
    null,
  );
  const [roles, setRoles] = useState<FeedbackRole[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: FeedbackRole) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hiringSignal) {
      setError(t.feedbackNeedQ1);
      return;
    }
    if (roles.length === 0) {
      setError(t.feedbackNeedQ2);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hiringSignalValue: hiringSignal,
          roles,
          locale,
          source: readStoredSource(),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || t.feedbackError);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.feedbackError);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="surface-card rounded-[24px] px-6 py-7 sm:px-8 sm:py-8">
        <p className="text-[15px] leading-relaxed text-black/70">
          {t.feedbackThanks}
        </p>
      </section>
    );
  }

  return (
    <section className="surface-card rounded-[24px] px-6 py-7 sm:px-8 sm:py-8">
      <div className="space-y-1.5">
        <p className="text-[13px] font-medium text-black/40">
          {t.feedbackSectionTitle}
        </p>
        <p className="text-[13px] leading-relaxed text-black/40">
          {t.feedbackSectionIntro}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-[15px] font-medium leading-snug text-black">
            {t.feedbackQ1}
          </legend>
          <div className="space-y-2">
            {HIRING_SIGNAL_VALUES.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-black/[0.06] bg-white px-4 py-3 text-[14px] text-black/75 transition-colors hover:border-black/[0.12]"
              >
                <input
                  type="radio"
                  name="hiringSignal"
                  value={value}
                  checked={hiringSignal === value}
                  onChange={() => setHiringSignal(value)}
                  className="mt-0.5"
                />
                <span>{t.feedbackQ1Options[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-[15px] font-medium leading-snug text-black">
            {t.feedbackQ2}
          </legend>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_ROLES.map((role) => {
              const selected = roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRole(role)}
                  className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                    selected
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/8 text-black"
                      : "border-black/[0.08] bg-white text-black/60 hover:border-black/[0.16]"
                  }`}
                >
                  {t.feedbackQ2Options[role]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <p className="text-[13px] text-red-600/80">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="brand-button inline-flex h-11 items-center justify-center rounded-full px-7 text-[14px] font-medium disabled:opacity-60"
        >
          {submitting ? t.feedbackSubmitting : t.feedbackSubmit}
        </button>
      </form>
    </section>
  );
}
