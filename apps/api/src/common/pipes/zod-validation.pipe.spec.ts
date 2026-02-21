import { describe, expect, it } from "vitest";
import { z, ZodError } from "zod";

import { ZodValidationPipe } from "./zod-validation.pipe";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe(schema);

  it("returns parsed value when data is valid", () => {
    const input = { email: "test@example.com", password: "password123" };

    expect(pipe.transform(input)).toEqual(input);
  });

  it("strips unknown keys from input", () => {
    const input = { email: "test@example.com", password: "password123", extra: "field" };

    expect(pipe.transform(input)).toEqual({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("throws ZodError when data is invalid", () => {
    const input = { email: "not-an-email", password: "short" };

    expect(() => pipe.transform(input)).toThrow(ZodError);
  });
});
