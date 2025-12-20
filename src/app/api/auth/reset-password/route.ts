import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, token, password, confirmPassword } = await req.json();

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawToken = String(token || "").trim();
    const rawPassword = String(password || "");
    const rawConfirm = String(confirmPassword || "");

    if (!normalizedEmail || !rawToken) {
      return NextResponse.json(
        { error: "reset_password_error_invalid_request" },
        { status: 400 }
      );
    }

    if (rawPassword.length < 8) {
      return NextResponse.json(
        { error: "reset_password_error_password_min" },
        { status: 400 }
      );
    }

    if (rawPassword !== rawConfirm) {
      return NextResponse.json(
        { error: "reset_password_error_password_match" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "reset_password_error" },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "reset_password_error_invalid_link" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ message: "reset_password_success" });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "reset_password_error_generic" },
      { status: 500 }
    );
  }
}
