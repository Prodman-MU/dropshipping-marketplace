/**
 * @file email.ts
 * @description Email Service Provider utility using Resend for Transactional & Admin Notifications.
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Masters Union Marketplace <onboarding@resend.dev>";

// Lazy initialize Resend client only if API key is provided
let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (!resendClient && RESEND_API_KEY && RESEND_API_KEY.startsWith("re_")) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  expiresInMinutes?: number;
}

/**
 * Sends a high-converting, styled HTML email containing the 6-digit OTP code to the Admin.
 */
export async function sendAdminPasswordResetOtp({
  to,
  otp,
  expiresInMinutes = 10,
}: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getResendClient();

    // High aesthetic HTML email body matching Apple x Masters Union brand styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Passcode Reset OTP</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 40px 20px; color: #111111; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E5E7EB; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .header { text-align: center; margin-bottom: 28px; }
          .badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; background: #F3F4F6; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 600; margin: 0 0 8px; color: #000000; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 20px; }
          .otp-box { background: #000000; color: #FFFFFF; border-radius: 14px; padding: 24px; text-align: center; margin: 28px 0; letter-spacing: 0.35em; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 700; }
          .footer { font-size: 12px; color: #9CA3AF; text-align: center; border-top: 1px solid #F3F4F6; padding-top: 20px; margin-top: 30px; }
          .highlight { font-weight: 600; color: #111111; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">SECURITY NOTIFICATION</span>
            <h1>Admin Passcode Reset</h1>
          </div>
          <p>We received a request to reset the administrator passcode for the <strong>Masters' Union Dropshipping Marketplace</strong>.</p>
          <p>Use the following 6-digit verification code to complete your reset. This code is valid for <span class="highlight">${expiresInMinutes} minutes</span>:</p>
          
          <div class="otp-box">${otp}</div>
          
          <p style="font-size: 13px; color: #6B7280;">If you did not request this passcode reset, please ignore this email or review your system security immediately.</p>
          
          <div class="footer">
            Masters' Union Dropshipping Marketplace • Automated Security System
          </div>
        </div>
      </body>
      </html>
    `;

    if (!client) {
      // In development / testing without a live Resend key: Log clearly to server console
      console.log("=================================================");
      console.log("📧 [EMAIL SERVICE - DEV FALLBACK]");
      console.log(`To: ${to}`);
      console.log(`Subject: Your Admin Passcode Reset Code: ${otp}`);
      console.log(`OTP Code: ${otp} (Valid for ${expiresInMinutes} mins)`);
      console.log("=================================================");
      return { success: true, messageId: "mock_dev_id_" + Date.now() };
    }

    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `Your Admin Passcode Reset Code: ${otp}`,
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Error] Failed to send email via Resend:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Sent] Reset OTP delivered to ${to} (Message ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email delivery error";
    console.error("[Email Exception]:", err);
    return { success: false, error: errorMsg };
  }
}
