import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import posthog from "posthog-js";
import Clarity from "@microsoft/clarity";

vi.mock("next/navigation", () => ({
  usePathname: () => "/marketplace",
  useSearchParams: () => new URLSearchParams("sort=price-asc"),
}));

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
  },
}));

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock("@microsoft/clarity", () => ({
  default: {
    init: vi.fn(),
  },
}));

describe("AnalyticsProvider Component", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_POSTHOG_KEY: "phc_test123",
      NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
      NEXT_PUBLIC_CLARITY_PROJECT_ID: "clarity_test456",
    };
  });

  it("renders children cleanly", () => {
    render(
      <AnalyticsProvider>
        <span data-testid="child-element">Marketplace Content</span>
      </AnalyticsProvider>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Marketplace Content")).toBeInTheDocument();
  });

  it("initializes PostHog and Clarity when credentials are present", () => {
    render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test123",
      expect.objectContaining({
        api_host: "/ingest",
        ui_host: "https://us.i.posthog.com",
        capture_pageview: false,
      })
    );
    expect(Clarity.init).toHaveBeenCalledWith("clarity_test456");
  });
});
