"use client";

import { useEffect } from "react";

export function SessionExpired() {
  useEffect(() => {
    void fetch("/api/auth/logout", {
      method: "POST",
      headers: { "x-adapt-requested-with": "adapt-client" },
      credentials: "same-origin",
    }).finally(() => {
      window.location.replace("/admin/login");
    });
  }, []);

  return (
    <main className="container-page flex min-h-screen items-center justify-center py-20">
      <div className="card max-w-md text-center">
        <h1 className="text-lg font-semibold text-white">Session expired</h1>
        <p className="mt-2 text-sm text-slate-400">Signing you out…</p>
      </div>
    </main>
  );
}
