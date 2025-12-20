import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "settings_error_not_authenticated" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    const rawCurrent = String(currentPassword || "");
    const rawNew = String(newPassword || "");
    const rawConfirm = String(confirmPassword || "");

    if (!rawCurrent) {
      return NextResponse.json(
        { error: "settings_error_current_password_required" },
        { status: 400 }
      );
    }
    if (rawNew.length < 8) {
      return NextResponse.json(
        { error: "settings_error_password_min" },
        { status: 400 }
      );
    }
    if (rawNew !== rawConfirm) {
      return NextResponse.json(
        { error: "settings_error_password_match" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "settings_error_user_invalid" },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(rawCurrent, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "settings_error_password_incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(rawNew, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "settings_password_updated" });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "settings_error_update_password" },
      { status: 500 }
    );
  }
}
