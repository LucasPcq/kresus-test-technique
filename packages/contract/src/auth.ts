import { z } from "zod";

const authBaseSchema = z.object({ email: z.email() });

const passwordSchema = z.string().trim().min(8).max(32);

export const registerSchema = authBaseSchema.extend({ password: passwordSchema });
export const loginSchema = authBaseSchema.extend({ password: z.string().trim().min(1).max(32) });
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
  familyId: string;
};

export type RefreshJwtPayload = JwtPayload & { jti: string };
