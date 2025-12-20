"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        username,
        email,
        password,
        confirmPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(t(result.error || "register_error_create"));
      return;
    }

    const signInResult = await signIn("credentials", {
      identifier: email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError(t("register_error_signin"));
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f6f7fb,_#e9eef5_45%,_#dbe3ee_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-3xl font-semibold tracking-tight">SellerBox</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("register_subtitle")}</p>
        </div>
        <div className="rounded-2xl border bg-background/95 p-6 shadow-sm">
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span>{t("register_name")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder={t("register_name_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>{t("register_username")}</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder={t("register_username_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>{t("register_email")}</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder={t("register_email_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>{t("register_password")}</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder={t("register_password_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>{t("register_confirm_password")}</span>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                placeholder={t("register_confirm_password_placeholder")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <button
              disabled={loading}
              type="submit"
              className="h-11 rounded-md bg-foreground text-background transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("register_loading") : t("register_submit")}
            </button>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
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
              {providerLoading === "google" ? t("login_connecting") : t("login_google")}
            </button>
            <button
              type="button"
              onClick={() => {
                setProviderLoading("apple");
                signIn("apple", { callbackUrl: "/dashboard" });
              }}
              className="h-11 rounded-md border border-input bg-background text-sm transition hover:bg-accent"
              disabled={providerLoading !== null}
            >
              {providerLoading === "apple" ? t("login_connecting") : t("login_apple")}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("register_have_account")}{" "}
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/login">
              {t("register_sign_in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
