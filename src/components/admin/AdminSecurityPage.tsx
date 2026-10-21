"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldAlert, ScrollText, Monitor, Users, SlidersHorizontal, RefreshCw } from "lucide-react";
import { apiGet, ClientError } from "@/lib/client";
import { SecurityAlertsPanel } from "@/components/admin/security/SecurityAlertsPanel";
import { SecurityAuditPanel } from "@/components/admin/security/SecurityAuditPanel";
import { SecuritySessionsPanel } from "@/components/admin/security/SecuritySessionsPanel";
import { SecurityAdminsPanel } from "@/components/admin/security/SecurityAdminsPanel";
import { SecuritySettingsPanel } from "@/components/admin/security/SecuritySettingsPanel";

type Tab = "alerts" | "audit" | "sessions" | "admins" | "settings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "alerts", label: "Alerts", icon: ShieldAlert },
  { id: "audit", label: "Audit log", icon: ScrollText },
  { id: "sessions", label: "Sessions & logins", icon: Monitor },
  { id: "admins", label: "Admin accounts", icon: Users },
  { id: "settings", label: "Security settings", icon: SlidersHorizontal },
];

export function AdminSecurityPage() {
  const [tab, setTab] = useState<Tab>("alerts");
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const res = await apiGet<{ openCount: number }>("/api/admin/security/alerts");
      setOpenCount(res.openCount);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Could not load security overview.");
    }
  }, []);

  useEffect(() => {
    void loadCount();
  }, [loadCount, refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Security</h1>
          <p className="mt-1 text-sm text-slate-400">
            Founder-only console: alerts, audit trail, session monitoring, admin access and platform hardening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {openCount !== null ? (
            <span className={`chip ${openCount > 0 ? "!border-red-500/40 !text-red-300" : "!border-emerald-500/40 !text-emerald-300"}`}>
              {openCount} open alert{openCount === 1 ? "" : "s"}
            </span>
          ) : null}
          <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="btn-ghost !px-3 !py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === id ? "bg-accent-500/15 text-white ring-1 ring-accent-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === "alerts" ? <SecurityAlertsPanel refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} /> : null}
      {tab === "audit" ? <SecurityAuditPanel /> : null}
      {tab === "sessions" ? <SecuritySessionsPanel /> : null}
      {tab === "admins" ? <SecurityAdminsPanel /> : null}
      {tab === "settings" ? <SecuritySettingsPanel /> : null}

      {openCount === null && tab !== "settings" ? (
        <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…</p>
      ) : null}
    </div>
  );
}
