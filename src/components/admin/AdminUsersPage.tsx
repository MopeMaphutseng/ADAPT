"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { Field, Toggle } from "@/components/admin/fields";
import { ROLE_LABELS } from "@/lib/constants";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: { id: string; name: string };
  createdAt: string;
}

const ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN", "COMMS_ADMIN"] as const;

const emptyForm = { name: "", email: "", password: "", role: "CONTENT_ADMIN" as string, active: true };

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setUsers(await apiGet<AdminUser[]>("/api/admin/users"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function reset() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await api(`/api/admin/users/${editing.id}`, {
          method: "PUT",
          body: { name: form.name, role: form.role as typeof ROLES[number], active: form.active },
        });
      } else {
        await api("/api/admin/users", { body: form });
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Delete user ${u.name} (${u.email})? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (editing?.id === u.id) reset();
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    }
  }

  function startEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role.name, active: u.active });
    setError("");
  }

  const inputCls = "input";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage administrator accounts and roles.</p>
        </div>
        <button type="button" onClick={reset} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New user
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p> : null}

      {!loading && (
        <div className="card max-w-2xl self-start !p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {editing ? `Edit ${editing.name}` : "Create user"}
          </h2>
          <form onSubmit={save} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="u-name" label="Name" required>
                <input id="u-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </Field>
              <Field id="u-email" label="Email" required>
                <input id="u-email" type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} required disabled={!!editing} />
              </Field>
              {!editing ? (
                <Field id="u-pass" label="Password" required hint="Minimum 12 characters.">
                  <input id="u-pass" type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={12} />
                </Field>
              ) : null}
              <Field id="u-role" label="Role">
                <select id="u-role" className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </Field>
            </div>
            {editing ? (
              <Toggle id="u-active" label="Active account" checked={form.active} onChange={(v) => set("active", v)} hint="Disabling blocks sign-in." />
            ) : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={reset} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {editing ? <><Pencil className="h-4 w-4" aria-hidden="true" /> Save changes</> : <><UserPlus className="h-4 w-4" aria-hidden="true" /> Create user</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : users.length === 0 ? (
        <div className="card text-center !py-14">
          <p className="text-slate-400">No users yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-ink-900/70">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Created</th>
                  <th className="table-th"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="bg-ink-900/30 hover:bg-ink-900/60">
                    <td className="table-td">
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </td>
                    <td className="table-td">{ROLE_LABELS[u.role.name] ?? u.role.name}</td>
                    <td className="table-td">
                      <span className={`chip ${u.active ? "!border-emerald-500/40 !text-emerald-300" : "!border-slate-700 !text-slate-500"}`}>
                        {u.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="table-td text-slate-400">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => startEdit(u)} className="rounded-lg p-2 text-slate-400 hover:text-white" aria-label={`Edit ${u.name}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => remove(u)} className="rounded-lg p-2 text-slate-400 hover:text-red-300" aria-label={`Delete ${u.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}