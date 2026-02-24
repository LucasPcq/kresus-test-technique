import { describe, expect, it } from "vitest";
import { Reflector } from "@nestjs/core";

import type { ThrottlerModuleOptions } from "@nestjs/throttler";
import type { ThrottlerStorage } from "@nestjs/throttler/dist/throttler-storage.interface";

import { CustomThrottlerGuard } from "./custom-throttler.guard";

const createGuard = () =>
	new CustomThrottlerGuard(
		[] as ThrottlerModuleOptions,
		{} as ThrottlerStorage,
		new Reflector(),
	);

describe("CustomThrottlerGuard", () => {
	describe("getTracker", () => {
		const guard = createGuard();
		const getTracker = (req: Record<string, unknown>) =>
			guard.getTracker(req as Parameters<typeof guard.getTracker>[0]);

		it("returns user ID when authenticated", async () => {
			const result = await getTracker({ user: { sub: "user-123" }, ip: "127.0.0.1" });

			expect(result).toBe("user-123");
		});

		it("returns IP when not authenticated", async () => {
			const result = await getTracker({ ip: "192.168.1.1" });

			expect(result).toBe("192.168.1.1");
		});

		it("returns IP when user has no sub", async () => {
			const result = await getTracker({ user: {}, ip: "10.0.0.1" });

			expect(result).toBe("10.0.0.1");
		});
	});
});
