import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "One login for IEEE IGNITE '26 participants, volunteers, organizers and admins.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
