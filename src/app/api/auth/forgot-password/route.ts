import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateResetToken, getResetExpiry } from "@/lib/auth-tokens";
import enTranslations from "@/locales/en.json";
import esTranslations from "@/locales/es.json";
import ruTranslations from "@/locales/ru.json";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email, lang } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const locale = ["en", "es", "ru"].includes(lang) ? lang : "en";
    const translations: Record<string, Record<string, string>> = {
      en: enTranslations,
      es: esTranslations,
      ru: ruTranslations,
    };
    const t = (key: string) =>
      translations[locale]?.[key] || translations.en?.[key] || key;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "forgot_password_error_invalid_email" },
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
          { error: "forgot_password_error_not_configured" },
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
        subject: t("reset_email_subject"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>${t("reset_email_heading")}</h2>
            <p>${t("reset_email_instruction")}</p>
            <p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p>
            <p>${t("reset_email_expiry")}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "forgot_password_success",
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "forgot_password_error_generic" },
      { status: 500 }
    );
  }
}
