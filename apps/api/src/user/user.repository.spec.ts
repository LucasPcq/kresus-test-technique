import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service";
import { UserRepository } from "./user.repository";

const mockPrisma = {
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
};

describe("UserRepository", () => {
	let repository: UserRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new UserRepository(mockPrisma as unknown as PrismaService);
	});

	describe("findByEmail", () => {
		it("calls prisma.user.findUnique with the email", async () => {
			const user = { id: "1", email: "test@example.com", password: "hash" };
			mockPrisma.user.findUnique.mockResolvedValue(user);

			const result = await repository.findByEmail({ email: "test@example.com" });

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: "test@example.com" },
			});
			expect(result).toEqual(user);
		});

		it("returns null when user is not found", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await repository.findByEmail({ email: "missing@example.com" });

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("calls prisma.user.create with provided data", async () => {
			const data = { email: "new@example.com", password: "hashed" };
			const created = { id: "2", ...data, createdAt: new Date(), updatedAt: new Date() };
			mockPrisma.user.create.mockResolvedValue(created);

			const result = await repository.create({ data });

			expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
			expect(result).toEqual(created);
		});
	});
});
