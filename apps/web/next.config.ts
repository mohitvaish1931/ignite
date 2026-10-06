import path from "path";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // The hackathon rulebook moved under /rulebooks with the other event rulebooks
    return [
      { source: "/hackathons/rulebook", destination: "/rulebooks/ieee-ignite-hackathon-2026", permanent: false },
      // Short, shareable links to the hackathon problem statements
      ...["/ps", "/problem-statements"].map((source) => ({ source, destination: "/hackathons/problem-statements", permanent: false })),
      // Accounts are switched off for now (see _backend/README.md): old account links go to the events list
      ...["/login", "/reset-password", "/dashboard", "/teams", "/teams/:id", "/jury"].map((source) => ({
        source,
        destination: "/events",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
