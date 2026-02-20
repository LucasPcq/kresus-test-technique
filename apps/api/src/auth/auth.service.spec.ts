import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn().mockResolvedValue("hashed_password"),
		compare: vi.fn(),
	},
}));

import bcrypt from "bcrypt";

const mockUserService = {
	findByEmail: vi.fn(),
	create: vi.fn(),
};

const mockJwtService = {
	sign: vi.fn().mockReturnValue("jwt_token"),
};

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new AuthService(
			mockUserService as unknown as UserService,
			mockJwtService as unknown as JwtService,
		);
	});

	describe("register", () => {
		it("creates a user and returns an access token", async () => {
			mockUserService.findByEmail.mockResolvedValue(null);
			mockUserService.create.mockResolvedValue({ id: "1", email: "test@example.com" });

			const result = await service.register({ email: "test@example.com", password: "password123" });

			expect(mockUserService.findByEmail).toHaveBeenCalledWith({ email: "test@example.com" });
			expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
			expect(mockUserService.create).toHaveBeenCalledWith({
				data: { email: "test@example.com", password: "hashed_password" },
			});
			expect(result).toEqual({ access_token: "jwt_token" });
		});

		it("throws ConflictException when email is already taken", async () => {
			mockUserService.findByEmail.mockResolvedValue({ id: "1", email: "test@example.com" });

			await expect(
				service.register({ email: "test@example.com", password: "password123" }),
			).rejects.toThrow(ConflictException);

			expect(mockUserService.create).not.toHaveBeenCalled();
		});
	});

	describe("login", () => {
		it("returns an access token when credentials are valid", async () => {
			mockUserService.findByEmail.mockResolvedValue({
				id: "1",
				email: "test@example.com",
				password: "hashed_password",
			});
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			const result = await service.login({ email: "test@example.com", password: "password123" });

			expect(result).toEqual({ access_token: "jwt_token" });
		});

		it("throws UnauthorizedException when user is not found", async () => {
			mockUserService.findByEmail.mockResolvedValue(null);

			await expect(
				service.login({ email: "missing@example.com", password: "password123" }),
			).rejects.toThrow(UnauthorizedException);
		});

		it("throws UnauthorizedException when password is incorrect", async () => {
			mockUserService.findByEmail.mockResolvedValue({
				id: "1",
				email: "test@example.com",
				password: "hashed_password",
			});
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				service.login({ email: "test@example.com", password: "wrong_password" }),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
