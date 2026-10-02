import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "IEEE IGNITE Hackathon 2026: a 24-hour offline software & hardware hackathon, 14-15 October 2026 at SKIT Jaipur. Teams of 1-4.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
