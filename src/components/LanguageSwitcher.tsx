"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const options: { id: Locale; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "zh", label: "中文" },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 text-[13px] tracking-wide"
      role="group"
      aria-label="Language"
    >
      {options.map((opt, index) => (
        <span key={opt.id} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-black/20">/</span>}
          <button
            type="button"
            onClick={() => setLocale(opt.id)}
            className={`px-1.5 py-1 transition-colors ${
              locale === opt.id
                ? "text-black"
                : "text-black/35 hover:text-black/70"
            }`}
            aria-pressed={locale === opt.id}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </div>
  );
}
