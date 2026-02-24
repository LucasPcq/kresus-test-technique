-- AlterTable: replace revoked Boolean with revokedAt DateTime
ALTER TABLE "RefreshToken" ADD COLUMN "revokedAt" TIMESTAMP(3);

-- Migrate existing data: set revokedAt to createdAt for revoked tokens
UPDATE "RefreshToken" SET "revokedAt" = "createdAt" WHERE "revoked" = true;

-- Drop old column
ALTER TABLE "RefreshToken" DROP COLUMN "revoked";
