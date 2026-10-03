import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jury Portal",
  description: "Evaluate IEEE IGNITE '26 hackathon submissions.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
