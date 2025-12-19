import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, confirmPassword, name, username } = await req.json();

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const displayName = String(name || "").trim();
    const rawPassword = String(password || "");
    const rawConfirm = String(confirmPassword || "");

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!emailValid) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (rawPassword.length < 8) {
      return NextResponse.json({ error: "Password mínimo 8 caracteres" }, { status: 400 });
    }
    if (rawPassword !== rawConfirm) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    if (normalizedUsername) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: normalizedUsername },
      });
      if (existingUsername) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const fallbackName =
      displayName || normalizedUsername || normalizedEmail.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: fallbackName,
        username: normalizedUsername || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
