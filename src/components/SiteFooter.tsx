"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const CONTACT_EMAIL = "w2jmoe@gmail.com";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-black/[0.06]">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-5 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-7">
        <div className="min-w-0">
          <p className="text-[13px] font-medium tracking-tight text-black/65">
            {t.footerBrand}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-black/40">
            {t.footerTagline}
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-[12px] text-black/35">{t.footerContactLabel}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-0.5 inline-block text-[13px] text-black/55 transition-colors hover:text-[color:var(--brand)]"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
