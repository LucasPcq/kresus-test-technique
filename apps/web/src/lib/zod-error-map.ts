import { z } from "zod";

type TranslateFunction = (key: string, named?: Record<string, unknown>, pluralCount?: number) => string;

const buildZodErrorMap = (t: TranslateFunction): z.core.$ZodErrorMap => {
  return (issue) => {
    switch (issue.code) {
      case "too_small":
        if (issue.origin === "string") {
          if (issue.minimum === 1) return t("zod.required");
          return t("zod.minChars", { min: issue.minimum });
        }
        if (issue.origin === "number") {
          return t("zod.minNumber", { min: issue.minimum });
        }
        if (issue.origin === "array") {
          return t("zod.minArray", { min: issue.minimum }, Number(issue.minimum));
        }
        break;

      case "too_big":
        if (issue.origin === "string") {
          return t("zod.maxChars", { max: issue.maximum });
        }
        if (issue.origin === "number") {
          return t("zod.maxNumber", { max: issue.maximum });
        }
        break;

      case "invalid_type":
        return t("zod.required");

      case "invalid_format":
        if (issue.format === "email") return t("zod.invalidEmail");
        if (issue.format === "url") return t("zod.invalidUrl");
        if (issue.format === "datetime") return t("zod.invalidDate");
        return t("zod.invalidFormat");

      case "invalid_value":
        return t("zod.invalidValue");

      case "custom":
        return issue.message;
    }
  };
};

export const setZodErrorMap = (t: TranslateFunction) => {
  z.config({ customError: buildZodErrorMap(t) });
};
