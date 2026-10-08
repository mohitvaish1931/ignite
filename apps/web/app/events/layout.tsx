import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse IEEE IGNITE '26 events, rulebooks and the hackathon problem statements.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
