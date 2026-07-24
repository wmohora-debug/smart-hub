import { cookies } from "next/headers";
import { SessionPayload, signSessionToken, verifySessionToken } from "./crypto";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function createSessionCookie(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const fullPayload: SessionPayload = { ...payload, expiresAt };
  const token = signSessionToken(fullPayload);

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return fullPayload;
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
