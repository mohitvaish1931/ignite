import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { getAdminJwtSecret } from "../../../../lib/auth-secret";

// Staff log in on the main site; it posts a 60-second signed pass here, which is
// exchanged for this app's own session cookie.

const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000").replace(/\/$/, "");
const PANEL_ROLES = ["SUPER_ADMIN", "ORGANIZER", "VOLUNTEER"];

function handoffSecret() {
  const secret = process.env.HANDOFF_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return null;
    return new TextEncoder().encode("dev_only_ignite_handoff_secret_2f81c0");
  }
  return new TextEncoder().encode(secret);
}

const backToLogin = (reason: string) => NextResponse.redirect(`${WEB_URL}/login?error=${reason}`, 303);

export async function POST(request: Request) {
  const secret = handoffSecret();
  if (!secret) {
    console.error("HANDOFF_SECRET is not configured; staff logins are disabled");
    return backToLogin("expired");
  }

  let token = "";
  try {
    const form = await request.formData();
    token = String(form.get("token") ?? "");
  } catch {
    return backToLogin("expired");
  }

  let claims: { userId: string; email: string; role: string };
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: "ignite-web",
      audience: "ignite-admin-handoff",
      maxTokenAge: "60s",
    });
    claims = { userId: String(payload.userId), email: String(payload.email ?? ""), role: String(payload.role) };
  } catch {
    return backToLogin("expired");
  }

  if (!PANEL_ROLES.includes(claims.role)) {
    return backToLogin("unauthorized");
  }

  const session = await new SignJWT({ userId: claims.userId, role: claims.role, email: claims.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(getAdminJwtSecret());

  // Volunteers work the check-in desk; everyone else lands on the dashboard
  const home = claims.role === "VOLUNTEER" ? "/scanner" : "/";
  const response = NextResponse.redirect(new URL(home, request.url), 303);
  response.cookies.set({
    name: "admin_token",
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}

// A stray GET (bookmark, refresh) just goes back to the single login page
export function GET() {
  return NextResponse.redirect(`${WEB_URL}/login`, 303);
}
