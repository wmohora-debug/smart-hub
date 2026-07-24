import { TableRepository } from "@/repositories/table.repository";
import { CreateTableDTO, UpdateTableDTO } from "@/types/dto";
import { createTableSchema, updateTableSchema } from "@/lib/validations/table";
import { generateQRCodeDataUrl } from "@/lib/qr-generator";
import { getTableQrUrl } from "@/lib/url";

export class TableService {
  static async getAllTables(restaurantId: string) {
    if (!restaurantId) throw new Error("Restaurant ID is required");
    return TableRepository.getAllByRestaurant(restaurantId);
  }

  static async getTableById(id: string) {
    if (!id) throw new Error("Table ID is required");
    return TableRepository.findById(id);
  }

  static async getTableBySlug(slug: string) {
    if (!slug) throw new Error("Table slug is required");
    return TableRepository.findBySlug(slug);
  }

  static generateSlug(name: string, tableNumber: number, zone?: string): string {
    const zonePrefix = zone && zone.trim() !== "" ? zone.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") : "table";
    const nameSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    // Default slug formats: table-1, vip-1, terrace-2, etc.
    if (nameSlug.startsWith("table") || nameSlug.startsWith("t-")) {
      return `table-${tableNumber}`;
    }
    return `${zonePrefix}-${tableNumber}`;
  }

  static async createTable(dto: CreateTableDTO) {
    const validated = createTableSchema.parse(dto);

    // Prevent duplicate table number for restaurant
    const existingNum = await TableRepository.findByNumber(
      validated.restaurantId,
      validated.tableNumber,
    );
    if (existingNum) {
      throw new Error(`Table number #${validated.tableNumber} already exists in this restaurant.`);
    }

    // Generate unique slug
    let slug = validated.slug
      ? validated.slug.toLowerCase().trim()
      : this.generateSlug(validated.name, validated.tableNumber, validated.zone);

    // Prevent duplicate slug
    const existingSlug = await TableRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Generate dynamic QR Code Data URL target using getTableQrUrl
    const qrTargetUrl = getTableQrUrl(slug);
    const qrCodeImage = await generateQRCodeDataUrl(qrTargetUrl);

    return TableRepository.create({
      ...validated,
      slug,
      qrCodeImage,
    });
  }

  static async updateTable(id: string, dto: UpdateTableDTO) {
    const validated = updateTableSchema.parse(dto);

    const table = await TableRepository.findById(id);
    if (!table) throw new Error("Table not found");

    if (
      validated.tableNumber !== undefined &&
      validated.tableNumber !== table.tableNumber
    ) {
      const existingNum = await TableRepository.findByNumber(
        table.restaurantId,
        validated.tableNumber,
      );
      if (existingNum && existingNum.id !== id) {
        throw new Error(`Table number #${validated.tableNumber} already exists in this restaurant.`);
      }
    }

    let slug = table.slug;
    let qrCodeImage = table.qrCodeImage ?? undefined;

    if (validated.slug && validated.slug.toLowerCase().trim() !== table.slug) {
      const newSlug = validated.slug.toLowerCase().trim();
      const existingSlug = await TableRepository.findBySlug(newSlug);
      if (existingSlug && existingSlug.id !== id) {
        throw new Error(`Table slug "${newSlug}" is already taken.`);
      }
      slug = newSlug;
      const qrTargetUrl = getTableQrUrl(slug);
      qrCodeImage = await generateQRCodeDataUrl(qrTargetUrl);
    }

    return TableRepository.update(id, {
      ...validated,
      slug,
      qrCodeImage,
    });
  }

  static async regenerateQRCode(id: string) {
    const table = await TableRepository.findById(id);
    if (!table) throw new Error("Table not found");

    const qrTargetUrl = getTableQrUrl(table.slug);
    const qrCodeImage = await generateQRCodeDataUrl(qrTargetUrl);

    return TableRepository.update(id, { qrCodeImage });
  }

  static async hardDeleteTable(id: string) {
    const table = await TableRepository.findById(id);
    if (!table) throw new Error("Table not found");

    // True database deletion
    return TableRepository.hardDelete(id);
  }
}
