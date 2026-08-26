-- CreateEnum
CREATE TYPE "AdSubmissionType" AS ENUM ('IMAGE_AD', 'VIDEO_AD', 'SHOWCASE');

-- CreateEnum
CREATE TYPE "AdSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "ad_submissions" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "AdSubmissionType" NOT NULL DEFAULT 'IMAGE_AD',
    "badge" TEXT NOT NULL DEFAULT 'VENDOR SPOTLIGHT',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "mediaSrc" TEXT NOT NULL,
    "ctaText" TEXT DEFAULT 'Explore Drop',
    "ctaLink" TEXT DEFAULT '#product-catalog',
    "status" "AdSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "adminFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ad_submissions_merchantId_status_idx" ON "ad_submissions"("merchantId", "status");

-- AddForeignKey
ALTER TABLE "ad_submissions" ADD CONSTRAINT "ad_submissions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
