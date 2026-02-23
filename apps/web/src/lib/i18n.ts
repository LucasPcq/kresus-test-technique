import { createI18n } from "vue-i18n";

import fr from "@/locales/fr.json";
import en from "@/locales/en.json";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = "app-locale";

const isSupportedLocale = (value: string): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

const resolveInitialLocale = (): SupportedLocale => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isSupportedLocale(stored)) return stored;

  const browserLang = navigator.language.slice(0, 2);
  if (isSupportedLocale(browserLang)) return browserLang;

  return "fr";
};

const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: "fr",
  messages: { fr, en },
  pluralRules: {
    fr: (choice: number) => (choice <= 1 ? 0 : 1),
  },
  datetimeFormats: {
    fr: {
      short: { day: "numeric", month: "short", year: "numeric" },
    },
    en: {
      short: { day: "numeric", month: "short", year: "numeric" },
    },
  },
});

export { SUPPORTED_LOCALES, STORAGE_KEY };
export default i18n;
