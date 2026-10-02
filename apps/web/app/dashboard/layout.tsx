import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your IEEE IGNITE '26 registrations, QR pass and teams.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
