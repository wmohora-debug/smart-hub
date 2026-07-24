import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const session = await AuthService.login(email, password);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json(
      { success: false, message },
      { status: 401 },
    );
  }
}
