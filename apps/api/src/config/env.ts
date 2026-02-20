import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	JWT_EXPIRES_IN: z.string().min(1),
	PORT: z.coerce.number().optional(),
	CORS_ORIGIN: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
	const result = envSchema.safeParse(process.env);
	if (!result.success) {
		console.error("Invalid environment variables:", result.error.format());
		throw new Error("Invalid environment variables");
	}
	return result.data;
}
