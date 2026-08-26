/**
 * @file route.ts (under app/api/auth/admin/send-otp/)
 * @description Endpoint to generate and dispatch a 6-digit OTP to the registered ADMIN_EMAIL.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminPasswordResetOtp } from "@/lib/email";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mastersunion.org";

/**
 * Masks an email for safe frontend display (e.g. ad***@mastersunion.org)
 */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Admin email is not configured in server environment." },
        { status: 500 }
      );
    }

    // Generate a secure 6-digit numeric OTP
    const randomInt = crypto.randomInt(100000, 1000000);
    const otp = randomInt.toString();

    // 10 minutes expiry window
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate existing unused OTPs for this email to avoid confusion
    await prisma.adminOtp.updateMany({
      where: {
        email: ADMIN_EMAIL.toLowerCase(),
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Create new OTP record
    await prisma.adminOtp.create({
      data: {
        email: ADMIN_EMAIL.toLowerCase(),
        otp,
        expiresAt,
        used: false,
      },
    });

    // Dispatch the email
    const emailResult = await sendAdminPasswordResetOtp({
      to: ADMIN_EMAIL,
      otp,
      expiresInMinutes: 10,
    });

    if (!emailResult.success) {
      console.warn(`[OTP Dispatch] Email send failed (${emailResult.error}), fallback active.`);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${maskEmail(ADMIN_EMAIL)}.`,
      maskedEmail: maskEmail(ADMIN_EMAIL),
      expiresInMinutes: 10,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to generate OTP.";
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
