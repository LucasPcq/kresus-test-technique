import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth";

describe("registerSchema", () => {
  it("should accept when email and password are valid", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "validPass1" });

    expect(result.success).toBe(true);
  });

  it("should reject when password is shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "short" });

    expect(result.success).toBe(false);
  });

  it("should reject when password exceeds 32 characters", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "a".repeat(33) });

    expect(result.success).toBe(false);
  });

  it("should accept when password is exactly 32 characters", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "a".repeat(32) });

    expect(result.success).toBe(true);
  });

  it("should reject when password contains only whitespace", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "        " });

    expect(result.success).toBe(false);
  });

  it("should reject when password trims below 8 characters", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: "  abc   " });

    expect(result.success).toBe(false);
  });

  it("should trim and accept when password has surrounding whitespace but 8+ content chars", () => {
    const result = registerSchema.safeParse({ email: "test@example.com", password: " abcdefgh " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe("abcdefgh");
    }
  });
});

describe("loginSchema", () => {
  it("should accept when email and password are provided", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "any" });

    expect(result.success).toBe(true);
  });

  it("should reject when password is empty", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });

    expect(result.success).toBe(false);
  });

  it("should reject when password exceeds 32 characters", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "a".repeat(33) });

    expect(result.success).toBe(false);
  });

  it("should trim password when it has surrounding whitespace", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "  pass  " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.password).toBe("pass");
    }
  });

  it("should reject when password is only whitespace", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "   " });

    expect(result.success).toBe(false);
  });
});
