import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateResetToken, getResetExpiry } from "@/lib/auth-tokens";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const apiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const appUrl = process.env.NEXTAUTH_URL;

      if (!apiKey || !fromEmail || !appUrl) {
        return NextResponse.json(
          { error: "Email no configurado en el servidor." },
          { status: 500 }
        );
      }

      const resend = new Resend(apiKey);
      const { token, tokenHash } = generateResetToken();
      const expiresAt = getResetExpiry(2);

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      const resetUrl = new URL("/reset-password", appUrl);
      resetUrl.searchParams.set("token", token);
      resetUrl.searchParams.set("email", normalizedEmail);

      await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Restablecer contraseña",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>Restablecer contraseña</h2>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p>
            <p>Este enlace expira en 2 horas.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message:
        "Si el correo existe, enviaremos un enlace de restablecimiento.",
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "No fue posible procesar la solicitud." },
      { status: 500 }
    );
  }
}
