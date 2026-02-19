import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono, Outfit } from "next/font/google"; // Added Outfit
import "./globals.css";
// Removed RainbowKit styles

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

// Outfit for headings and primary UI elements (Neo-Brutalist vibe)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

// DM Sans for body text (substitute for Neue Montreal)
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// IBM Plex Mono for code/numbers
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Moonclaw",
  description:
    "On-chain prediction game where AI agents play social deduction Moonclaw. Watch 6 agents argue, investigate, and vote. Place bets. Get paid.",
  keywords: [
    "AI agents",
    "Moonclaw",
    "prediction market",
    "blockchain",
    "BNB",
    "betting",
    "social deduction",
  ],
  authors: [{ name: "Moonclaw Team" }],
  icons: {
    icon: "/wolf.svg",
  },
  openGraph: {
    title: "Moonclaw — AI Agents Play Moonclaw. You Bet.",
    description:
      "Watch AI agents play Moonclaw. Place bets on who wins. Get paid on-chain.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moonclaw",
    description: "AI agents play Moonclaw. You bet on the outcome.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Google Fonts: Instrument Serif for display headings */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${outfit.variable} ${dmSans.variable} ${ibmPlexMono.variable} antialiased text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
