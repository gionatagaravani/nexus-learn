"use client";

import { useTranslation } from "@/lib/i18n/i18n-context";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale("en")}
        className={`text-sm font-medium ${locale === "en" ? "text-black" : "text-neutral-500 hover:text-black"} transition-colors`}
      >
        EN
      </button>
      <span className="text-neutral-300">|</span>
      <button
        onClick={() => setLocale("it")}
        className={`text-sm font-medium ${locale === "it" ? "text-black" : "text-neutral-500 hover:text-black"} transition-colors`}
      >
        IT
      </button>
    </div>
  );
}
