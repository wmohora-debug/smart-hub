import { prisma } from "@/lib/prisma";

export class AdminUserRepository {
  static async findByEmail(email: string) {
    return prisma.adminUser.findFirst({
      where: { email: email.toLowerCase().trim(), isDeleted: false, isActive: true },
      include: { restaurant: true },
    });
  }

  static async findById(id: string) {
    return prisma.adminUser.findFirst({
      where: { id, isDeleted: false },
      include: { restaurant: true },
    });
  }

  static async updateLastLogin(id: string) {
    return prisma.adminUser.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }
}
