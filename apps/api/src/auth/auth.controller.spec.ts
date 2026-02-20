import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const mockAuthService = {
	register: vi.fn(),
	login: vi.fn(),
};

describe("AuthController", () => {
	let controller: AuthController;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new AuthController(mockAuthService as unknown as AuthService);
	});

	describe("register", () => {
		it("parses body with registerSchema and calls authService.register", async () => {
			const token = { access_token: "jwt_token" };
			mockAuthService.register.mockResolvedValue(token);

			const result = await controller.register({ email: "test@example.com", password: "password123" });

			expect(mockAuthService.register).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(result).toEqual(token);
		});

		it("throws ZodError when body is invalid", () => {
			expect(() => controller.register({ email: "not-an-email", password: "short" })).toThrow();
		});
	});

	describe("login", () => {
		it("parses body with loginSchema and calls authService.login", async () => {
			const token = { access_token: "jwt_token" };
			mockAuthService.login.mockResolvedValue(token);

			const result = await controller.login({ email: "test@example.com", password: "password123" });

			expect(mockAuthService.login).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(result).toEqual(token);
		});

		it("throws ZodError when body is invalid", () => {
			expect(() => controller.login({ email: "not-an-email", password: "" })).toThrow();
		});
	});
});
