import type { Metadata, Viewport } from "next";
import { Orbitron, Press_Start_2P, Rajdhani, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Typefaces from the IEEE IGNITE '26 design
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-hud",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

import { Header } from "./components/Header";
import SpaceBackdrop from "./components/SpaceBackdrop";

const title = "IEEE IGNITE '26 - Flagship Technical Conclave";
const description =
  "IEEE IGNITE '26: the annual flagship technical conclave & global hackathon. 12 - 15 October 2026 at SKIT Jaipur, including the 24-hour IEEE IGNITE Hackathon on 14 - 15 October.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: title, template: "%s | IEEE IGNITE '26" },
  description,
  keywords: ["IEEE", "IGNITE", "hackathon", "tech fest", "technical conclave", "student branch"],
  openGraph: { title, description, type: "website", siteName: "IEEE IGNITE '26" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#030408",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${pressStart.variable} ${rajdhani.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#030408] text-slate-200 font-sans overflow-x-hidden selection:bg-orange-500/30" suppressHydrationWarning>
        <SpaceBackdrop />
        <Header />

        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  );
}
