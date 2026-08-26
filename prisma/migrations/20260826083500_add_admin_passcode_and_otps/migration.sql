-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "adminPasscode" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "admin_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admin_otps_email_otp_idx" ON "admin_otps"("email", "otp");
