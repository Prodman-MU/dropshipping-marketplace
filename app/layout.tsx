import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "MASTERS UNION // Dropshipping 2026 — Bauhaus Marketplace",
  description: "High-margin architectural & minimalist catalog for Masters Union dropshippers. Direct Shopify integration and webhook moderation.",
};

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

