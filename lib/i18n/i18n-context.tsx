"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en, it, Dictionary } from "./dictionaries";

type Locale = "en" | "it";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries: Record<Locale, Dictionary> = { en, it };

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "it")) {
      setLocaleState(savedLocale);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "it") {
        setLocaleState("it");
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (keyPath: string, values?: Record<string, string | number>) => {
    const keys = keyPath.split(".");
    let current: any = dictionaries[locale];

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation key not found: ${keyPath}`);
        return keyPath;
      }
      current = current[key];
    }

    if (typeof current !== "string") {
      console.warn(`Translation key does not resolve to a string: ${keyPath}`);
      return keyPath;
    }

    if (values) {
      return Object.entries(values).reduce((str, [key, value]) => {
        return str.replace(`{${key}}`, String(value));
      }, current);
    }

    return current;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
