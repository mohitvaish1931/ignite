// Server-only helpers for the single login: staff accounts are handed over to the
// admin app with a short-lived, signed pass. Not a "use server" module on purpose.
import crypto from "crypto";
import { SignJWT } from "jose";

export type StaffRole = "SUPER_ADMIN" | "ORGANIZER" | "VOLUNTEER";

export const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001").replace(/\/$/, "");

function handoffSecret() {
  const secret = process.env.HANDOFF_SECRET;
  if (!secret) {
    // A guessable fallback would let anyone mint admin passes, so production must configure it
    if (process.env.NODE_ENV === "production") throw new Error("HANDOFF_SECRET is not configured");
    return new TextEncoder().encode("dev_only_ignite_handoff_secret_2f81c0");
  }
  return new TextEncoder().encode(secret);
}

/** Built-in super admin account (no database row). Configure via env in production. */
export function isSuperAdmin(email: string, password: string) {
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL;
  const configuredPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production" && (!configuredEmail || !configuredPassword)) return false;

  const expectedEmail = (configuredEmail || "adminignite@gmail.com").toLowerCase();
  const expectedPassword = configuredPassword || "ieee@2026";
  const a = Buffer.from(password);
  const b = Buffer.from(expectedPassword);
  const passwordMatches = a.length === b.length && crypto.timingSafeEqual(a, b);
  return email.trim().toLowerCase() === expectedEmail && passwordMatches;
}

/** A 60-second, single-purpose pass the admin app exchanges for its own session. */
export async function createAdminHandoff(user: { userId: string; email: string; role: StaffRole }) {
  const token = await new SignJWT({ userId: user.userId, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("ignite-web")
    .setAudience("ignite-admin-handoff")
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(handoffSecret());

  return { url: `${ADMIN_URL}/api/auth/handoff`, token };
}
