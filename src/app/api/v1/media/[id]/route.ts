import { NextResponse } from "next/server";
import { MediaService } from "@/services";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

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
