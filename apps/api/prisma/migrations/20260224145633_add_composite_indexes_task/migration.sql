-- DropIndex
DROP INDEX "Task_completedAt_idx";

-- DropIndex
DROP INDEX "Task_executionDate_idx";

-- DropIndex
DROP INDEX "Task_priority_idx";

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Task_userId_createdAt_idx" ON "Task"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_userId_priority_idx" ON "Task"("userId", "priority");

-- CreateIndex
CREATE INDEX "Task_userId_executionDate_idx" ON "Task"("userId", "executionDate");

-- CreateIndex
CREATE INDEX "Task_userId_completedAt_idx" ON "Task"("userId", "completedAt");
