import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { type SupportedLocale, SUPPORTED_LOCALES, STORAGE_KEY } from "@/lib/i18n";
import { setZodErrorMap } from "@/lib/zod-error-map";

export function useLocale() {
  const { locale, t } = useI18n();

  const currentLocale = computed(() => locale.value as SupportedLocale);

  const currentLocaleLabel = computed(() => t(`locale.${locale.value}`));

  const setLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale;
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    setZodErrorMap(t);
  };

  const toggleLocale = () => {
    const idx = SUPPORTED_LOCALES.indexOf(currentLocale.value);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length] ?? "fr";
    setLocale(next);
  };

  return {
    currentLocale,
    currentLocaleLabel,
    locales: SUPPORTED_LOCALES,
    setLocale,
    toggleLocale,
  };
}
