import path from "path";
import crypto from "crypto";
import { put, del } from "@vercel/blob";
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

    // 4. Unique Pathname Generation (folder/timestamp-randomHex.ext)
    const randomHex = crypto.randomBytes(8).toString("hex");
    const safeFilename = `${sanitizedFolder}-${Date.now()}-${randomHex}${ext}`;
    const blobPathname = `${sanitizedFolder}/${safeFilename}`;

    // 5. Upload to Vercel Blob Storage
    const blob = await put(blobPathname, fileBuffer, {
      access: "public",
      contentType: mimeType,
    });

    // 6. Save MediaAsset metadata in PostgreSQL with public Vercel Blob URL
    return MediaRepository.create({
      restaurantId,
      filename: originalFilename,
      url: blob.url,
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

    // Delete file from Vercel Blob storage if it's a Vercel Blob URL
    if (asset.url.startsWith("http://") || asset.url.startsWith("https://")) {
      try {
        await del(asset.url);
      } catch {
        // Silently continue if blob is already removed or during local test
      }
    }

    // True database deletion
    return MediaRepository.delete(id);
  }
}
