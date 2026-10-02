import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getAdminJwtSecret } from "../lib/auth-secret";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Admin | IEEE IGNITE '26", template: "%s | IGNITE Admin" },
  description: "Manage IEEE IGNITE '26 events, hackathons, check-ins and users.",
  robots: { index: false, follow: false },
};

import { NavigationProvider, AppShell, Toaster } from "@project-organizer/ui";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  let userRole: any = "ORGANIZER"; // Default fallback
  let user: { email: string; role: any } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getAdminJwtSecret());
      if (payload.role) {
        userRole = payload.role;
        user = { email: String(payload.email ?? ""), role: payload.role };
      }
    } catch {
      // Expired or invalid token: the proxy sends the user to /login
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        <NavigationProvider initialRole={userRole} user={user}>
          <AppShell>{children}</AppShell>
        </NavigationProvider>
        <Toaster />
      </body>
    </html>
  );
}
