import { beforeEach, describe, expect, it, vi } from "vitest";

import { RefreshTokenRepository } from "./refresh-token.repository";
import { TokenCleanupService } from "./token-cleanup.service";

const mockRefreshTokenRepository = {
  deleteExpired: vi.fn(),
};

describe("TokenCleanupService", () => {
  let service: TokenCleanupService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TokenCleanupService(mockRefreshTokenRepository as unknown as RefreshTokenRepository);
  });

  describe("handleExpiredTokens", () => {
    it("should delete expired tokens when called", async () => {
      mockRefreshTokenRepository.deleteExpired.mockResolvedValue({ count: 5 });

      await service.handleExpiredTokens();

      expect(mockRefreshTokenRepository.deleteExpired).toHaveBeenCalledOnce();
    });
  });
});
