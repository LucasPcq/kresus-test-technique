import { z } from "zod";

const authBaseSchema = z.object({ email: z.email() });

export const registerSchema = authBaseSchema.extend({ password: z.string().min(8) });
export const loginSchema = authBaseSchema.extend({ password: z.string().min(1) });
export const authUserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;
export type AuthResult = { token: string; refreshToken: string; user: AuthUserResponse };

export type JwtPayload = {
  sub: string;
  email: string;
};
