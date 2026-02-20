import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export type JwtPayload = { sub: string; email: string };
export type AuthTokenResponse = { access_token: string };
