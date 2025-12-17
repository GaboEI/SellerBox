"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("test1@test.com");
  const [password, setPassword] = useState("Test12345!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res) {
      setError("No response from signIn()");
      return;
    }

    if (res.error) {
      setError(res.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #444" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #444" }}
          />
        </label>

        <button
          disabled={loading}
          type="submit"
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #666",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && (
          <div style={{ color: "#ff6b6b", fontWeight: 600 }}>
            Error: {error}
          </div>
        )}
      </form>
    </div>
  );
}