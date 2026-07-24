import { NextResponse } from "next/server";
import { MediaService } from "@/services";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await MediaService.deleteMediaAsset(id);

    return NextResponse.json({
      success: true,
      message: "Media asset deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete media asset";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
