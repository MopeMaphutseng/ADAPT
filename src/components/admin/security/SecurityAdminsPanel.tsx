"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus, ShieldCheck, ShieldOff, KeyRound } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { Field } from "@/components/admin/fields";
import { ROLE_LABELS } from "@/lib/constants";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: { name: string; label?: string };
}

const ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN", "COMMS_ADMIN"] as const;
const ROLE_HINTS: Record<string, string> = {
  SUPER_ADMIN: "Full founder access: content, communications, security, admin control.",
  CONTENT_ADMIN: "Projects, achievements, announcements, media and site content.",
  COMMS_ADMIN: "Investor and contact communications only.",
};

export function SecurityAdminsPanel() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "COMMS_ADMIN" as (typeof ROLES)[number] });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<AdminRow[]>("/api/admin/users");
      setRows(res);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load admin accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/users", { method: "POST", body: form });
      setForm({ name: "", email: "", password: "", role: "COMMS_ADMIN" });
      setShowCreate(false);
      setNotice("Admin account created.");
      await load();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      await api(`/api/admin/users/${id}`, { method: "PUT", body: { role } });
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Could not change role.");
    }
  }

  async function toggleActive(row: AdminRow) {
    try {
      await api(`/api/admin/users/${row.id}`, { method: "PUT", body: { active: !row.active } });
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Could not update status.");
    }
  }

  async function resetPassword(id: string, name: string) {
    const pw = prompt(`New password for ${name} (min 12 characters):`);
    if (!pw) return;
    if (pw.length < 12) {
      alert("Password must be at least 12 characters.");
      return;
    }
    try {
      await api(`/api/admin/users/${id}`, { method: "PUT", body: { newPassword: pw } });
      setNotice(`Password reset for ${name}.`);
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Could not reset password.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Control who can sign in and what they can do. The last active Super Admin cannot be demoted or disabled.
        </p>
        <button type="button" onClick={() => setShowCreate((v) => !v)} className="btn-primary !px-4 !py-2 text-sm">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> New admin
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p> : null}

      {showCreate ? (
        <form onSubmit={create} className="card space-y-4 !p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="na-name" label="Full name" required>
              <input id="na-name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </Field>
            <Field id="na-email" label="Email" required>
              <input id="na-email" type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </Field>
            <Field id="na-password" label="Temporary password" required hint="At least 12 characters.">
              <input id="na-password" type="text" className="input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={12} />
            </Field>
            <Field id="na-role" label="Role" required hint={ROLE_HINTS[form.role]}>
              <select id="na-role" className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as (typeof ROLES)[number] }))}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary !px-4 !py-2 text-sm">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />} Create account
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost !px-4 !py-2 text-sm">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No admin accounts.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800/70">
                  <td className="px-4 py-3">
                    <p className="text-white">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.email}</p>
                    {!r.active ? <span className="chip mt-1 !border-slate-700 !text-slate-500">Disabled</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.role.name}
                      onChange={(e) => changeRole(r.id, e.target.value)}
                      className="input !w-auto !py-1.5 text-xs"
                      aria-label={`Role for ${r.name}`}
                    >
                      {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role] ?? role}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString("en-GB") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => resetPassword(r.id, r.name)} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Reset password">
                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" /> Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(r)}
                        className={`btn-ghost !px-2.5 !py-1.5 text-xs ${r.active ? "!border-red-500/30 !text-red-300 hover:!bg-red-500/10" : "!border-emerald-500/30 !text-emerald-300"}`}
                      >
                        {r.active ? <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                        {r.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
