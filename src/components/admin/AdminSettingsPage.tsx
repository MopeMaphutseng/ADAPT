"use client";

import { useState } from "react";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { api, ClientError } from "@/lib/client";
import { Field } from "@/components/admin/fields";

export function AdminSettingsPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.newPassword.length < 12) {
      setError("Your new password must be at least 12 characters long.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/users", {
        method: "PATCH",
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password updated. Use it next time you sign in.");
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "input";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Account and security preferences for your login.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="card self-start !p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <KeyRound className="h-4 w-4 text-accent-400" aria-hidden="true" />
            Change your password
          </h2>
          <p className="mt-1 text-xs text-slate-500">Use a strong, unique password of at least 12 characters.</p>

          {error ? <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p> : null}
          {success ? <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p> : null}

          <div className="mt-4 space-y-4">
            <Field id="s-current" label="Current password" required>
              <input id="s-current" type="password" autoComplete="current-password" className={inputCls} value={form.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} required />
            </Field>
            <Field id="s-new" label="New password" required>
              <input id="s-new" type="password" autoComplete="new-password" className={inputCls} value={form.newPassword} onChange={(e) => set("newPassword", e.target.value)} required />
            </Field>
            <Field id="s-confirm" label="Confirm new password" required>
              <input id="s-confirm" type="password" autoComplete="new-password" className={inputCls} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} required />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              Update password
            </button>
          </div>
        </form>

        <div className="card self-start !p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">About this system</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3"><span className="shrink-0 text-accent-400">·</span> Sign-in requires a valid administrator account.</li>
            <li className="flex gap-3"><span className="shrink-0 text-accent-400">·</span> Roles control what each user can see and edit in this dashboard.</li>
            <li className="flex gap-3"><span className="shrink-0 text-accent-400">·</span> Public content changes publish instantly and are logged for audit.</li>
            <li className="flex gap-3"><span className="shrink-0 text-accent-400">·</span> For password resets, a Super Admin can set a user's password from the Users page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}