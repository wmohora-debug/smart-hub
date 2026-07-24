import { AdminUserRepository } from "@/repositories/admin-user.repository";
import { verifyPassword } from "@/lib/auth/crypto";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";

export class AuthService {
  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const user = await AdminUserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials.");
    }

    await AdminUserRepository.updateLastLogin(user.id);

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    await createSessionCookie(sessionPayload);

    return sessionPayload;
  }

  static async logout() {
    await clearSessionCookie();
  }
}
