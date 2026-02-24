import { ref } from "vue";
import { describe, expect, it } from "vitest";

import { ApiError } from "../client";
import { getApiErrorMessage, useApiErrorMessage } from "../error";

describe("getApiErrorMessage", () => {
  it("should return validation message for status 400", () => {
    const error = new ApiError(400, {});
    expect(getApiErrorMessage(error)).toBe(
      "Données invalides. Vérifiez les champs du formulaire.",
    );
  });

  it("should return forbidden message for status 403", () => {
    const error = new ApiError(403, {});
    expect(getApiErrorMessage(error)).toBe(
      "Vous n'avez pas les droits pour effectuer cette action.",
    );
  });

  it("should return not found message for status 404", () => {
    const error = new ApiError(404, {});
    expect(getApiErrorMessage(error)).toBe("Ressource introuvable.");
  });

  it("should return rate limit message for status 429", () => {
    const error = new ApiError(429, {});
    expect(getApiErrorMessage(error)).toBe(
      "Trop de requêtes. Veuillez réessayer dans quelques instants.",
    );
  });

  it("should return default message for unmapped status", () => {
    const error = new ApiError(500, {});
    expect(getApiErrorMessage(error)).toBe("Une erreur est survenue. Veuillez réessayer.");
  });

  it("should return default message for non-ApiError", () => {
    const error = new Error("network failure");
    expect(getApiErrorMessage(error)).toBe("Une erreur est survenue. Veuillez réessayer.");
  });

  it("should use override for a status not in defaults", () => {
    const error = new ApiError(401, {});
    expect(getApiErrorMessage(error, { 401: "Identifiants incorrects" })).toBe(
      "Identifiants incorrects",
    );
  });

  it("should use override over default for the same status", () => {
    const error = new ApiError(400, {});
    expect(getApiErrorMessage(error, { 400: "Custom validation error" })).toBe(
      "Custom validation error",
    );
  });

  it("should fall back to default when override does not match status", () => {
    const error = new ApiError(404, {});
    expect(getApiErrorMessage(error, { 401: "Identifiants incorrects" })).toBe(
      "Ressource introuvable.",
    );
  });
});

describe("useApiErrorMessage", () => {
  it("should return null when error is null", () => {
    const error = ref<Error | null>(null);
    const message = useApiErrorMessage(error);
    expect(message.value).toBeNull();
  });

  it("should return error message when error is set", () => {
    const error = ref<Error | null>(new ApiError(400, {}));
    const message = useApiErrorMessage(error);
    expect(message.value).toBe("Données invalides. Vérifiez les champs du formulaire.");
  });

  it("should react to error changes", () => {
    const error = ref<Error | null>(null);
    const message = useApiErrorMessage(error);

    expect(message.value).toBeNull();

    error.value = new ApiError(404, {});
    expect(message.value).toBe("Ressource introuvable.");

    error.value = null;
    expect(message.value).toBeNull();
  });

  it("should apply overrides", () => {
    const error = ref<Error | null>(new ApiError(409, {}));
    const message = useApiErrorMessage(error, { 409: "Cet email est déjà utilisé" });
    expect(message.value).toBe("Cet email est déjà utilisé");
  });
});
