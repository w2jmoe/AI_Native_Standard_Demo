"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.04] bg-[color:var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-[13px] font-medium tracking-tight text-black/75 transition-colors hover:text-black"
        >
          {t.brand}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
