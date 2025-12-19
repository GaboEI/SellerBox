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
        { error: "Solicitud inválida." },
        { status: 400 }
      );
    }

    if (rawPassword.length < 8) {
      return NextResponse.json(
        { error: "Password mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    if (rawPassword !== rawConfirm) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No se pudo restablecer la contraseña." },
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
        { error: "El enlace es inválido o expiró." },
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

    return NextResponse.json({ message: "Password actualizado." });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "No fue posible restablecer la contraseña." },
      { status: 500 }
    );
  }
}
