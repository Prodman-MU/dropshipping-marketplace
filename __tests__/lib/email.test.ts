import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendAdminPasswordResetOtp } from "@/lib/email";

describe("lib/email - Email Notification Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handles development fallback gracefully without crashing when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendAdminPasswordResetOtp({
      to: "admin@mastersunion.org",
      otp: "987654",
      expiresInMinutes: 10,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("mock_dev_id_");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("EMAIL SERVICE - DEV FALLBACK")
    );

    consoleSpy.mockRestore();
  });
});
