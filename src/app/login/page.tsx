"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAppleNoticeOpen, setIsAppleNoticeOpen] = useState(false);

  const errorParam = searchParams.get("error");
  const fromParam = searchParams.get("from");
  const errorMessage = (() => {
    if (!errorParam) return null;
    switch (errorParam) {
      case "CredentialsSignin":
        return t("login_error_credentials");
      case "OAuthAccountNotLinked":
        return t("login_error_oauth_linked");
      case "AccessDenied":
        return t("login_error_access_denied");
      default:
        return t("login_error_generic");
    }
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res) {
      setError(t("login_error_no_response"));
      return;
    }

    if (res.error) {
      setError(t("login_error_credentials"));
      return;
    }

    router.push(fromParam || "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f6f7fb,_#e9eef5_45%,_#dbe3ee_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-3xl font-semibold tracking-tight">SellerBox</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("login_subtitle")}</p>
        </div>
        <div className="rounded-2xl border bg-background/95 p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-end gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span>{t("login_identifier")}</span>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                required
                placeholder={t("login_identifier_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>{t("login_password")}</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder={t("login_password_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="text-right text-xs">
              <Link className="text-muted-foreground underline-offset-4 hover:underline" href="/forgot-password">
                {t("login_forgot_password")}
              </Link>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="h-11 rounded-md bg-foreground text-background transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("login_loading") : t("login_submit")}
            </button>

            {(error || errorMessage) && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error || errorMessage}
              </div>
            )}
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("login_or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => {
                setProviderLoading("google");
                signIn("google", { callbackUrl: "/dashboard" });
              }}
              className="h-11 rounded-md border border-input bg-background text-sm transition hover:bg-accent"
              disabled={providerLoading !== null}
            >
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.94 32.659 29.364 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.202 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.273 4 24 4 16.318 4 9.656 8.402 6.306 14.691Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.259 0 10.028-2.016 13.56-5.303l-6.264-5.303C29.243 34.918 26.71 36 24 36c-5.346 0-9.909-3.319-11.287-7.946l-6.506 5.017C9.523 39.556 16.227 44 24 44Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.096 3.045-3.389 5.569-6.007 7.394l.003-.002 6.264 5.303C34.364 38.5 40 34 40 24c0-1.341-.138-2.65-.389-3.917Z"
                  />
                </svg>
                {providerLoading === "google" ? t("login_connecting") : t("login_google")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProviderLoading("apple");
                setProviderLoading(null);
                setIsAppleNoticeOpen(true);
              }}
              className="h-11 rounded-md border border-input bg-background text-sm transition hover:bg-accent"
              disabled={providerLoading !== null}
            >
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.6 8.7c0-1.5.8-2.7 2-3.3-.7-1-1.8-1.6-3-1.7-1.3-.1-2.5.8-3.1.8s-1.6-.8-2.7-.8c-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.6 2.7-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.5-2 1-1.4 1.4-2.7 1.4-2.8-.1 0-2.7-1-2.7-3.9Zm-2-6.6c.6-.7 1-1.7.9-2.7-.9.1-2 .6-2.6 1.3-.6.7-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z"
                  />
                </svg>
                {providerLoading === "apple" ? t("login_connecting") : t("login_apple")}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("login_no_account")}{" "}
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/register">
              {t("login_create_account")}
            </Link>
          </div>
        </div>
      </div>
      <Dialog open={isAppleNoticeOpen} onOpenChange={setIsAppleNoticeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apple_signin_title")}</DialogTitle>
            <DialogDescription className="text-sm text-foreground whitespace-pre-line">
              {t("apple_signin_message")}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
