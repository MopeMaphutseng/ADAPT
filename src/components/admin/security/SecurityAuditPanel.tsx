"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, ClientError } from "@/lib/client";

interface ActivityLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export function SecurityAuditPanel() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [action, setAction] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ logs: ActivityLog[]; actions: string[] }>("/api/admin/security/audit", { action, q });
      setLogs(res.logs);
      setActions(res.actions);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load audit log.");
    } finally {
      setLoading(false);
    }
  }, [action, q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search action, entity, IP…"
          className="input !w-64"
          aria-label="Search audit log"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)} className="input !w-auto" aria-label="Filter by action">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs text-slate-500">{logs.length} entr{logs.length === 1 ? "y" : "ies"}</span>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No audit entries.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-800/70">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString("en-GB")}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-accent-300">{l.action}</td>
                  <td className="px-4 py-2.5 text-slate-300">{l.user ? l.user.email : <span className="text-slate-600">system / anonymous</span>}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">
                    {l.entity ?? "—"}
                    {l.entityId ? <span className="text-slate-600"> · {l.entityId.slice(0, 8)}…</span> : null}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{l.ip ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
