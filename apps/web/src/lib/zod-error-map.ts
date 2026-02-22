import { z } from "zod";

const frenchErrorMap: z.core.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "too_small":
      if (issue.origin === "string") {
        if (issue.minimum === 1) return "Ce champ est requis";
        return `Minimum ${issue.minimum} caractères`;
      }
      if (issue.origin === "number") {
        return `La valeur doit être au moins ${issue.minimum}`;
      }
      if (issue.origin === "array") {
        return `Au moins ${issue.minimum} élément${Number(issue.minimum) > 1 ? "s" : ""} requis`;
      }
      break;

    case "too_big":
      if (issue.origin === "string") {
        return `Maximum ${issue.maximum} caractères`;
      }
      if (issue.origin === "number") {
        return `La valeur doit être au plus ${issue.maximum}`;
      }
      break;

    case "invalid_type":
      return "Ce champ est requis";

    case "invalid_format":
      if (issue.format === "email") return "Adresse email invalide";
      if (issue.format === "url") return "URL invalide";
      if (issue.format === "datetime") return "Date invalide";
      return "Format invalide";

    case "invalid_value":
      return "Valeur invalide";

    case "custom":
      return issue.message;
  }
};

export const setFrenchZodErrorMap = () => {
  z.config({ customError: frenchErrorMap });
};
