-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "teamPreferences" JSONB NOT NULL,
    "positives" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
