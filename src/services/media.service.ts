import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { MediaRepository } from "@/repositories/media.repository";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class MediaService {
  static async getMediaLibrary(
    restaurantId?: string,
    folder?: string,
    query?: string,
  ) {
    return MediaRepository.getAllMediaAssets(restaurantId, folder, query);
  }

  static async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folderName: string = "general",
    restaurantId?: string,
  ) {
    // 1. Size Validation
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File size exceeds maximum limit of 10 MB.");
    }

    // 2. MIME Type & Extension Validation
    const ext = path.extname(originalFilename).toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType) || !ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(
        "Invalid file type. Only PNG, JPG, JPEG, and WEBP image files are allowed.",
      );
    }

    // 3. Folder Sanitization
    const validFolders = ["restaurants", "menu-items", "categories", "temp", "general"];
    const sanitizedFolder = validFolders.includes(folderName.toLowerCase())
      ? folderName.toLowerCase()
      : "general";

    // 4. Unique Filename Generation (timestamp + random hex + extension)
    const randomHex = crypto.randomBytes(8).toString("hex");
    const safeFilename = `${sanitizedFolder}-${Date.now()}-${randomHex}${ext}`;

    // 5. Ensure Upload Directory Exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", sanitizedFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    // 6. Write File to Disk
    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, fileBuffer);

    // 7. Save MediaAsset metadata in PostgreSQL
    const publicUrl = `/uploads/${sanitizedFolder}/${safeFilename}`;
    return MediaRepository.create({
      restaurantId,
      filename: originalFilename,
      url: publicUrl,
      folder: sanitizedFolder,
      mimeType,
      size: fileBuffer.length,
    });
  }

  static async deleteMediaAsset(id: string) {
    const asset = await MediaRepository.findById(id);
    if (!asset) throw new Error("Media asset not found.");

    // Deletion Protection: Check usage across Restaurant, Category, and MenuItem
    const [restaurantMatch, categoryMatch, menuItemMatch] = await Promise.all([
      prisma.restaurant.findFirst({
        where: {
          isDeleted: false,
          OR: [{ logo: asset.url }, { banner: asset.url }, { favicon: asset.url }],
        },
        select: { name: true },
      }),
      prisma.category.findFirst({
        where: { image: asset.url },
        select: { name: true },
      }),
      prisma.menuItem.findFirst({
        where: { image: asset.url },
        select: { name: true },
      }),
    ]);

    if (restaurantMatch) {
      throw new Error(
        `Cannot delete image. It is currently in use as branding media for restaurant "${restaurantMatch.name}".`,
      );
    }
    if (categoryMatch) {
      throw new Error(
        `Cannot delete image. It is currently in use for category "${categoryMatch.name}".`,
      );
    }
    if (menuItemMatch) {
      throw new Error(
        `Cannot delete image. It is currently in use for menu item "${menuItemMatch.name}".`,
      );
    }

    // Unlink physical file from disk if local
    if (asset.url.startsWith("/uploads/")) {
      const localFilePath = path.join(process.cwd(), "public", asset.url);
      try {
        await fs.unlink(localFilePath);
      } catch {
        // Silently continue if physical file is already removed
      }
    }

    // True database deletion
    return MediaRepository.delete(id);
  }
}
