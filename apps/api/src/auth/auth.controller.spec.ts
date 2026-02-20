import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const mockAuthService = {
	register: vi.fn(),
	login: vi.fn(),
};

const mockConfigService = {
	get: vi.fn().mockReturnValue(undefined),
	getOrThrow: vi.fn().mockReturnValue("7d"),
};

const mockRes = {
	cookie: vi.fn(),
} as unknown as Response;

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new AuthController(
			mockAuthService as unknown as AuthService,
			mockConfigService as unknown as ConfigService,
		);
	});

	describe("register", () => {
		it("sets cookie and returns user info", async () => {
			const user = { id: "1", email: "test@example.com" };
			mockAuthService.register.mockResolvedValue({ token: "jwt_token", user });

			const result = await controller.register({ email: "test@example.com", password: "password123" }, mockRes);

			expect(mockAuthService.register).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(mockRes.cookie).toHaveBeenCalledWith(
				"access_token",
				"jwt_token",
				expect.objectContaining({ httpOnly: true }),
			);
			expect(result).toEqual(user);
		});

		it("throws ZodError when body is invalid", async () => {
			await expect(
				controller.register({ email: "not-an-email", password: "short" }, mockRes),
			).rejects.toThrow();
		});
	});

	describe("login", () => {
		it("sets cookie and returns user info", async () => {
			const user = { id: "1", email: "test@example.com" };
			mockAuthService.login.mockResolvedValue({ token: "jwt_token", user });

			const result = await controller.login({ email: "test@example.com", password: "password123" }, mockRes);

			expect(mockAuthService.login).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(mockRes.cookie).toHaveBeenCalledWith(
				"access_token",
				"jwt_token",
				expect.objectContaining({ httpOnly: true }),
			);
			expect(result).toEqual(user);
		});

		it("throws ZodError when body is invalid", async () => {
			await expect(
				controller.login({ email: "not-an-email", password: "" }, mockRes),
			).rejects.toThrow();
		});
	});
});
