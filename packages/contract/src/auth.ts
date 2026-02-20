import { z } from "zod";

const authBaseSchema = z.object({ email: z.email() });

export const registerSchema = authBaseSchema.extend({ password: z.string().min(8) });
export const loginSchema = authBaseSchema.extend({ password: z.string().min(1) });
export const authTokenResponseSchema = z.object({ access_token: z.string() });

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
