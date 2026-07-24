import crypto from "crypto";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "SUPER_ADMIN" | "RESTAURANT_OWNER" | "MANAGER" | "STAFF";
  restaurantId?: string | null;
  expiresAt: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "smart-menu-namchi-enterprise-secret-key-2026";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    // Fallback for raw seed password check during initial dev testing
    return password === "admin123" || password === "password";
  }
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(testHash));
}

export function signSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [data, signature] = token.split(".");
    const expectedSignature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
    
    if (signature !== expectedSignature) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}
