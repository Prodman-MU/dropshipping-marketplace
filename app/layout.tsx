/**
 * @file layout.tsx (under app/)
 * @description Global Root Layout for Next.js 16 App Router.
 * 
 * Sets up custom Google Fonts (Inter for body typography and Space Grotesk for Bauhaus display headings),
 * global SEO metadata, light-mode `#F4F4F0` canvas styling, and high-contrast text selection highlights.
 */

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Configure body sans-serif font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Configure display heading font for Bauhaus aesthetic
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

/**
 * Default global application metadata
 */
export const metadata: Metadata = {
  title: "MASTERS UNION // Dropshipping 2026 — Bauhaus Marketplace",
  description:
    "High-margin architectural & minimalist catalog for Masters Union dropshippers. Direct Shopify integration and webhook moderation.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F4F0] text-[#111111] font-sans selection:bg-[#FFB703] selection:text-[#111111]">
        {children}
      </body>
    </html>
  );
}
