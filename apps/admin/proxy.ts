import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET is not configured");
    return new TextEncoder().encode("fallback_secret_key_for_development_only_12345");
  }
  return new TextEncoder().encode(secret);
}

const PANEL_ROLES = ["SUPER_ADMIN", "ORGANIZER", "VOLUNTEER"];

// The single login lives on the main site
const WEB_LOGIN_URL = `${(process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000").replace(/\/$/, "")}/login`;

// Volunteers only work the check-in desk
function isVolunteerPath(pathname: string) {
  return pathname === "/scanner" || pathname === "/api/scan" || pathname.startsWith("/api/auth");
}

function redirectToLogin() {
  const response = NextResponse.redirect(WEB_LOGIN_URL);
  response.cookies.delete("admin_token");
  return response;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");

  if (!token && !isPublicPath) {
    return NextResponse.redirect(WEB_LOGIN_URL);
  }

  if (token) {
    let role: string | undefined;
    try {
      const { payload } = await jwtVerify(token, jwtSecret());
      role = typeof payload.role === "string" ? payload.role : undefined;
    } catch (error) {
      // Invalid token
      if (!isPublicPath) return redirectToLogin();
      return NextResponse.next();
    }

    // A validly signed token without a panel role is not an admin session
    if (!role || !PANEL_ROLES.includes(role)) {
      return isPublicPath ? NextResponse.next() : redirectToLogin();
    }

    // If user is already logged in and tries to go to login page, redirect to their home
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(role === "VOLUNTEER" ? "/scanner" : "/", request.url));
    }

    if (role === "VOLUNTEER" && !isVolunteerPath(pathname)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/scanner", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public images (logo, icons), which must load on the login page too
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
