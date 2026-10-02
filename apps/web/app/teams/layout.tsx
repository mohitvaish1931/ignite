import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team HQ",
  description: "Manage your IEEE IGNITE '26 hackathon teams.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
