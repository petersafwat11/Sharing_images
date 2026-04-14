-- CreateEnum
CREATE TYPE "PortraitStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('SIGNUP_BONUS', 'PURCHASE', 'GENERATION', 'REFUND');

-- AlterTable — add creditBalance to existing users
ALTER TABLE "users" ADD COLUMN "creditBalance" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "portraits" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "status" "PortraitStatus" NOT NULL DEFAULT 'PENDING',
    "themeSlug" TEXT NOT NULL,
    "inputKeys" TEXT[],
    "replicateId" TEXT,
    "shareSlug" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portraits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portrait_results" (
    "id" TEXT NOT NULL,
    "portraitId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "blurHash" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portrait_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "type" "CreditType" NOT NULL,
    "description" TEXT NOT NULL,
    "stripeId" TEXT,
    "portraitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portraits_shareSlug_key" ON "portraits"("shareSlug");

-- CreateIndex
CREATE INDEX "portraits_userId_idx" ON "portraits"("userId");

-- CreateIndex
CREATE INDEX "portraits_shareSlug_idx" ON "portraits"("shareSlug");

-- CreateIndex
CREATE INDEX "portraits_createdAt_idx" ON "portraits"("createdAt");

-- CreateIndex
CREATE INDEX "portrait_results_portraitId_idx" ON "portrait_results"("portraitId");

-- CreateIndex
CREATE INDEX "credit_transactions_userId_idx" ON "credit_transactions"("userId");

-- AddForeignKey
ALTER TABLE "portraits" ADD CONSTRAINT "portraits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portrait_results" ADD CONSTRAINT "portrait_results_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "portraits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
