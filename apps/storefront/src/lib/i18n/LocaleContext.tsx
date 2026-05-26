"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "./dictionaries/en.json";
import de from "./dictionaries/de.json";
import fr from "./dictionaries/fr.json";

export type Locale = "en" | "de" | "fr";

const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  de,
  fr,
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("veloce_locale") as Locale;
      if (savedLocale === "en" || savedLocale === "de" || savedLocale === "fr") {
        return savedLocale;
      }
    }
    return "en";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("veloce_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, fallback?: string): string => {
    const dictionary = dictionaries[locale] || dictionaries.en;
    return dictionary[key] || fallback || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {/* Avoid hydration flicker by rendering children only when mounted or defaulting nicely */}
      <span className={mounted ? "" : "opacity-0 transition-opacity duration-300"}>
        {children}
      </span>
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LocaleProvider");
  }
  return context;
}
