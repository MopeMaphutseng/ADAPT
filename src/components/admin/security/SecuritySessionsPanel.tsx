"use client";

import { useCallback, useEffect, useState } from "react";
import { Circle, Activity } from "lucide-react";
import { apiGet, ClientError } from "@/lib/client";

interface Session {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  currentlyActive: boolean;
}

interface LoginEvent {
  id: string;
  action: string;
  ip: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface FailureByIp {
  ip: string | null;
  count: number;
}

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.login_failed": "Failed sign-in",
  "auth.logout": "Signed out",
};

export function SecuritySessionsPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [failures, setFailures] = useState<FailureByIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ sessions: Session[]; loginEvents: LoginEvent[]; failuresByIp: FailureByIp[] }>(
        "/api/admin/security/sessions",
      );
      setSessions(res.sessions);
      setEvents(res.loginEvents);
      setFailures(res.failuresByIp);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load session data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          <Activity className="h-4 w-4" aria-hidden="true" /> Admin accounts
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-ink-900/60 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="border-t border-slate-800/70">
                    <td className="px-4 py-2.5">
                      <p className="text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{s.role}</td>
                    <td className="px-4 py-2.5">
                      {!s.active ? (
                        <span className="chip !border-slate-700 !text-slate-500">Disabled</span>
                      ) : s.currentlyActive ? (
                        <span className="chip !border-emerald-500/40 !text-emerald-300"><Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" /> Active now</span>
                      ) : (
                        <span className="chip !border-slate-700 !text-slate-400">Idle</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString("en-GB") : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Sessions use short-lived signed tokens; “Active now” reflects activity in the last hour.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Recent sign-in activity</h2>
          <ul className="space-y-2">
            {loading ? (
              <li className="text-sm text-slate-400">Loading…</li>
            ) : events.length === 0 ? (
              <li className="card text-sm text-slate-500">No sign-in activity in the last 7 days.</li>
            ) : (
              events.map((e) => (
                <li key={e.id} className="card flex items-center justify-between gap-3 !p-3">
                  <div className="min-w-0">
                    <p className={`text-sm ${e.action === "auth.login_failed" ? "text-red-300" : "text-slate-200"}`}>
                      {ACTION_LABELS[e.action] ?? e.action}
                    </p>
                    <p className="truncate text-xs text-slate-500">{e.user?.email ?? "unknown account"}{e.ip ? ` · ${e.ip}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{new Date(e.createdAt).toLocaleString("en-GB")}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Failed logins by IP (7 days)</h2>
          <ul className="space-y-2">
            {loading ? (
              <li className="text-sm text-slate-400">Loading…</li>
            ) : failures.length === 0 ? (
              <li className="card text-sm text-slate-500">No failed logins recorded.</li>
            ) : (
              failures.map((f, i) => (
                <li key={`${f.ip}-${i}`} className="card flex items-center justify-between gap-3 !p-3">
                  <span className="font-mono text-sm text-slate-300">{f.ip ?? "unknown IP"}</span>
                  <span className={`chip ${f.count >= 5 ? "!border-red-500/40 !text-red-300" : ""}`}>{f.count} attempt{f.count === 1 ? "" : "s"}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
