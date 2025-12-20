import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "settings_error_not_authenticated" }, { status: 401 });
  }

  try {
    const { newEmail, currentPassword } = await req.json();
    const normalizedEmail = String(newEmail || "").trim().toLowerCase();
    const rawPassword = String(currentPassword || "");

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "settings_error_invalid_email" }, { status: 400 });
    }
    if (!rawPassword) {
      return NextResponse.json(
        { error: "settings_error_password_required" },
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

    const passwordValid = await bcrypt.compare(rawPassword, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "settings_error_password_incorrect" },
        { status: 400 }
      );
    }

    const emailInUse = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (emailInUse) {
      return NextResponse.json(
        { error: "settings_error_email_in_use" },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: normalizedEmail },
    });

    return NextResponse.json({
      message: "settings_email_updated",
      logout: true,
    });
  } catch (error) {
    console.error("CHANGE_EMAIL_ERROR:", error);
    return NextResponse.json(
      { error: "settings_error_update_email" },
      { status: 500 }
    );
  }
}
