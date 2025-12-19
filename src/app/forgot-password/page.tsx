"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "No fue posible enviar el email.");
      return;
    }

    setMessage(result.message || "Revisa tu correo.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f6f7fb,_#e9eef5_45%,_#dbe3ee_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-3xl font-semibold tracking-tight">SellerBox</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Recuperar contraseña
          </p>
        </div>
        <div className="rounded-2xl border bg-background/95 p-6 shadow-sm">
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="correo@ejemplo.com"
                className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <button
              disabled={loading}
              type="submit"
              className="h-11 rounded-md bg-foreground text-background transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/login">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
