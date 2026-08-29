/**
 * @file layout.tsx (under app/)
 * @description Global Root Layout for Next.js 16 App Router.
 * 
 * Sets up custom Google Fonts:
 * - Inter for crisp UI and body typography
 * - Playfair Display for high-contrast MR PORTER-style editorial headlines
 * - JetBrains Mono for Grailed-style micro-data tags and spec details
 * 
 * Pure white `#FFFFFF` gallery canvas with subtle dark text selection highlights.
 */

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

// Configure body sans-serif font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configure editorial serif font for MR PORTER aesthetic headlines
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Configure monospace font for Grailed micro-data & SKU tags
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Mobile-first viewport metadata configuration
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

/**
 * Default global application metadata
 */
export const metadata: Metadata = {
  title: "MASTERS UNION // DROPSHIPPING 2026 — Curated Marketplace",
  description:
    "Gallery-grade dropshipping marketplace inspired by Apple Store, MR PORTER, and Grailed. Direct Shopify synchronization and curated supplier network.",
};

/**
 * Root Layout Component wrapping all application routes.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111111] font-sans selection:bg-[#111111] selection:text-white">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}

