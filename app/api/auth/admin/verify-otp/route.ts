/**
 * @file route.ts (under app/api/auth/admin/verify-otp/)
 * @description Endpoint to verify 6-digit OTP and reset Admin passcode.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mastersunion.org";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { otp, newPasscode } = body;

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: "A valid 6-digit verification code is required." },
        { status: 400 }
      );
    }

    if (!newPasscode || typeof newPasscode !== "string" || newPasscode.trim().length < 4) {
      return NextResponse.json(
        { error: "New passcode must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const cleanOtp = otp.trim();
    const cleanPasscode = newPasscode.trim();

    // Find the latest valid OTP record for ADMIN_EMAIL
    const otpRecord = await prisma.adminOtp.findFirst({
      where: {
        email: ADMIN_EMAIL.toLowerCase(),
        otp: cleanOtp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as used immediately to prevent replay
    await prisma.adminOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Update the database-persisted Admin passcode in SiteSetting
    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: { adminPasscode: cleanPasscode },
      create: {
        id: "default",
        adminPasscode: cleanPasscode,
      },
    });

    console.log(`[Admin Security] Admin passcode successfully reset via verified OTP for ${ADMIN_EMAIL}`);

    return NextResponse.json({
      success: true,
      message: "Admin passcode has been reset successfully.",
      newPasscode: cleanPasscode,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to verify OTP.";
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
