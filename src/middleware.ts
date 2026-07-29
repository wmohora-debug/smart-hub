import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  restaurantId?: string | null;
  expiresAt: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "smart-menu-namchi-enterprise-secret-key-2026";

async function verifySessionTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || !token.includes(".")) return null;
    const [data, signature] = token.split(".");

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const sigArray = Array.from(new Uint8Array(sigBuffer));
    const expectedSig = btoa(String.fromCharCode(...sigArray))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSig) return null;

    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (!payload || typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const session = sessionCookie ? await verifySessionTokenEdge(sessionCookie) : null;

    // 1. Root /admin -> redirect to dashboard or login
    if (pathname === "/admin" || pathname === "/admin/") {
      const target = session ? "/admin/dashboard" : "/admin/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // 2. Unauthenticated user visiting protected admin route -> redirect to login immediately
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
