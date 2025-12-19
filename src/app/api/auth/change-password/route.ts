import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    const rawCurrent = String(currentPassword || "");
    const rawNew = String(newPassword || "");
    const rawConfirm = String(confirmPassword || "");

    if (!rawCurrent) {
      return NextResponse.json(
        { error: "Password actual requerido." },
        { status: 400 }
      );
    }
    if (rawNew.length < 8) {
      return NextResponse.json(
        { error: "Password mínimo 8 caracteres." },
        { status: 400 }
      );
    }
    if (rawNew !== rawConfirm) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "No se pudo validar el usuario." },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(rawCurrent, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Password actual incorrecto." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(rawNew, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password actualizado." });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "No fue posible actualizar la contraseña." },
      { status: 500 }
    );
  }
}
