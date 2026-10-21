"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, Eye } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";

interface SecurityAlert {
  id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  type: string;
  title: string;
  detail: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  acknowledgedAt: string | null;
  user: { id: string; name: string; email: string } | null;
  acknowledgedBy: { id: string; name: string } | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "!border-slate-600 !text-slate-300",
  LOW: "!border-sky-500/40 !text-sky-300",
  MEDIUM: "!border-amber-500/40 !text-amber-300",
  HIGH: "!border-orange-500/40 !text-orange-300",
  CRITICAL: "!border-red-500/50 !text-red-300",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  OPEN: ShieldAlert,
  ACKNOWLEDGED: Eye,
  RESOLVED: CheckCircle2,
  DISMISSED: XCircle,
};

export function SecurityAlertsPanel({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ alerts: SecurityAlert[] }>("/api/admin/security/alerts", {
        status: statusFilter,
        severity: severityFilter,
      });
      setAlerts(res.alerts);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function update(id: string, status: string) {
    const note = status === "RESOLVED" || status === "DISMISSED" ? prompt("Optional note for the record:") ?? undefined : undefined;
    try {
      await api(`/api/admin/security/alerts`, { method: "PATCH", body: { id, status, note } });
      await load();
      onChanged();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Update failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input !w-auto" aria-label="Filter by status">
          <option value="">All statuses</option>
          {["OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input !w-auto" aria-label="Filter by severity">
          <option value="">All severities</option>
          {["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-500">{alerts.length} alert{alerts.length === 1 ? "" : "s"}</span>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="card text-center !py-12">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" aria-hidden="true" />
          <p className="mt-3 text-slate-400">No security alerts. All clear.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const Icon = STATUS_ICON[a.status] ?? ShieldAlert;
            return (
              <li key={a.id} className="card !p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <p className="font-medium text-white">{a.title}</p>
                      <span className={`chip ${SEVERITY_STYLES[a.severity]}`}>{a.severity}</span>
                      <span className="chip">{a.status}</span>
                      <span className="chip !text-slate-400">{a.type}</span>
                    </div>
                    {a.detail ? <p className="mt-2 text-sm text-slate-300">{a.detail}</p> : null}
                    <p className="mt-1.5 text-xs text-slate-500">
                      {new Date(a.createdAt).toLocaleString("en-GB")}
                      {a.ip ? ` · from ${a.ip}` : ""}
                      {a.user ? ` · ${a.user.name}` : ""}
                      {a.acknowledgedBy ? ` · handled by ${a.acknowledgedBy.name}` : ""}
                    </p>
                    {a.meta && Object.keys(a.meta).length > 0 ? (
                      <p className="mt-1 break-all font-mono text-[11px] text-slate-600">{JSON.stringify(a.meta)}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "OPEN" ? (
                      <button type="button" onClick={() => update(a.id, "ACKNOWLEDGED")} className="btn-ghost !px-3 !py-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Acknowledge
                      </button>
                    ) : null}
                    {a.status !== "RESOLVED" ? (
                      <button type="button" onClick={() => update(a.id, "RESOLVED")} className="btn-ghost !px-3 !py-1.5 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Resolve
                      </button>
                    ) : null}
                    {a.status !== "DISMISSED" ? (
                      <button type="button" onClick={() => update(a.id, "DISMISSED")} className="btn-ghost !px-3 !py-1.5 text-xs !border-red-500/30 !text-red-300 hover:!bg-red-500/10">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Dismiss
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
