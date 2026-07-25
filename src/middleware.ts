import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  expiresAt: number;
}

function parseSessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [data] = token.split(".");
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload: SessionPayload = JSON.parse(jsonStr);
    if (payload && typeof payload.expiresAt === "number" && Date.now() < payload.expiresAt) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const session = sessionCookie ? parseSessionToken(sessionCookie) : null;

    // 1. Root /admin -> redirect to dashboard or login
    if (pathname === "/admin" || pathname === "/admin/") {
      const target = session ? "/admin/dashboard" : "/admin/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // 2. Unauthenticated user visiting protected admin route -> redirect to login
    if (!session && pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Authenticated user visiting /admin/login -> redirect to dashboard
    if (session && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
