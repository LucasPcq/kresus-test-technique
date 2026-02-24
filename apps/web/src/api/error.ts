import { type Ref, computed } from "vue";

import { ApiError } from "./client";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue. Veuillez réessayer.";

const API_ERROR_MESSAGES: Readonly<Record<number, string>> = {
  400: "Données invalides. Vérifiez les champs du formulaire.",
  403: "Vous n'avez pas les droits pour effectuer cette action.",
  404: "Ressource introuvable.",
  429: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
};

export const getApiErrorMessage = (
  error: Error,
  overrides?: Partial<Record<number, string>>,
): string => {
  if (!(error instanceof ApiError)) return DEFAULT_ERROR_MESSAGE;
  return overrides?.[error.status] ?? API_ERROR_MESSAGES[error.status] ?? DEFAULT_ERROR_MESSAGE;
};

export const useApiErrorMessage = (
  error: Ref<Error | null>,
  overrides?: Partial<Record<number, string>>,
) => {
  return computed(() => {
    if (!error.value) return null;
    return getApiErrorMessage(error.value, overrides);
  });
};
