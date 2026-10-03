// Server-only session helpers. Deliberately NOT a "use server" module:
// exporting these as server actions would let any client mint a session.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "viewer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week
const AUDIENCE = "ignite-web";

// Kept separate from the admin app's JWT_SECRET so a participant session
// can never be replayed as an admin token.
function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is not configured");
  }
  return new TextEncoder().encode(value || "dev_only_web_session_secret_change_me_6f2c1a");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(sessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { audience: AUDIENCE });
    return payload.sub ?? null;
  } catch {
    // Expired, tampered, or a legacy raw-UUID cookie
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
