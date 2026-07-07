"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { localeCookieName, type Locale } from "../lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: {
    language: string;
    english: string;
    chinese: string;
  };
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const router = useRouter();

  function changeLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">
      <Languages size={16} />
      <span className="sr-only">{labels.language}</span>
      <select className="bg-transparent text-sm font-medium outline-none" value={locale} aria-label={labels.language} onChange={(event) => changeLocale(event.target.value as Locale)}>
        <option value="en">{labels.english}</option>
        <option value="zh">{labels.chinese}</option>
      </select>
    </label>
  );
}
