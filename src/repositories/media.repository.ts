import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateMediaAssetDTO } from "@/types/dto";

export class MediaRepository {
  static async getAllMediaAssets(
    restaurantId?: string,
    folder?: string,
    query?: string,
  ) {
    const where: Prisma.MediaAssetWhereInput = {};

    if (restaurantId) {
      where.OR = [{ restaurantId }, { restaurantId: null }];
    }

    if (folder && folder !== "all") {
      where.folder = folder;
    }

    if (query && query.trim()) {
      const q = query.trim();
      where.filename = { contains: q, mode: "insensitive" };
    }

    return prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.mediaAsset.findUnique({
      where: { id },
    });
  }

  static async findByUrl(url: string) {
    return prisma.mediaAsset.findFirst({
      where: { url },
    });
  }

  static async create(data: CreateMediaAssetDTO) {
    return prisma.mediaAsset.create({
      data: {
        restaurantId: data.restaurantId,
        filename: data.filename,
        url: data.url,
        folder: data.folder,
        mimeType: data.mimeType,
        size: data.size,
        width: data.width,
        height: data.height,
      },
    });
  }

  static async delete(id: string) {
    return prisma.mediaAsset.delete({
      where: { id },
    });
  }
}
