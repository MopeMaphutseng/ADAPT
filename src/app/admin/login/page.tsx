"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { api, ClientError } from "@/lib/client";
import { LogoMark } from "@/components/brand/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ user: { role: string } }>("/api/auth/login", {
        body: { email, password },
      });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ClientError
          ? err.message || "Invalid email or password."
          : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={52} />
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">ADAPT Technologies</h1>
          <p className="mt-1 text-sm text-slate-400">Management Platform — Secure Sign In</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                className="input pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-white"
              >
                {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
          {error ? (
            <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Authorized personnel only. All access is monitored and logged.
        </p>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline">
            ← Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}