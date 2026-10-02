import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse and register for IEEE IGNITE '26 events, workshops and competitions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
