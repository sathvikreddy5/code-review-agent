-- CreateTable
CREATE TABLE "FeedbackEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issue" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackEvent_type_idx" ON "FeedbackEvent"("type");

-- CreateIndex
CREATE INDEX "FeedbackEvent_createdAt_idx" ON "FeedbackEvent"("createdAt");
