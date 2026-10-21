"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Mail, Phone, Building2, Globe2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { INVESTOR_STATUSES, INVESTOR_TYPES } from "@/lib/constants";
import type { InvestorInquiry } from "@prisma/client";

const STATUS_STYLES: Record<string, string> = {
  NEW: "!border-accent-500/40 !text-accent-300",
  CONTACTED: "!border-sky-500/40 !text-sky-300",
  IN_DISCUSSION: "!border-emerald-500/40 !text-emerald-300",
  FOLLOW_UP: "!border-amber-500/40 !text-amber-300",
  CLOSED: "!border-slate-700 !text-slate-500",
};

export function AdminInvestorsPage() {
  const [items, setItems] = useState<InvestorInquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [active, setActive] = useState<InvestorInquiry | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const list = await apiGet<InvestorInquiry[]>("/api/admin/investors", { status: filter, q });
      setItems(list);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q]);

  function open(m: InvestorInquiry) {
    setSelectedId(m.id);
    setActive(m);
  }

  async function setStatus(status: string) {
    if (!active) return;
    setUpdating(true);
    try {
      const updated = await api<InvestorInquiry>(`/api/admin/investors/${active.id}`, { method: "PATCH", body: { status } });
      setActive(updated);
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Update failed.");
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    if (!active) return;
    if (!confirm("Delete this inquiry permanently?")) return;
    try {
      await api(`/api/admin/investors/${active.id}`, { method: "DELETE" });
      setActive(null);
      setSelectedId(null);
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    }
  }

  const statusLabel = (s: string) => INVESTOR_STATUSES.find((x) => x.value === s)?.label ?? s;
  const typeLabel = (t: string) => INVESTOR_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Investor Inquiries</h1>
        <p className="mt-1 text-sm text-slate-400">Potential investors, partners and funding leads.</p>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setLoading(true); }}
          placeholder="Search name, organization, email…"
          className="input !w-64"
          aria-label="Search inquiries"
        />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setLoading(true); }} className="input !w-auto" aria-label="Filter by status">
          <option value="">All statuses</option>
          {INVESTOR_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{items.length} inquiry{items.length === 1 ? "" : "ies"}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card text-center !py-14">
          <p className="text-slate-400">No inquiries match this view.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <ul className="space-y-2 lg:col-span-2">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === m.id
                      ? "border-accent-500/50 bg-accent-500/10"
                      : "border-slate-800 bg-ink-900/40 hover:bg-ink-900/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-white">
                      {m.status === "NEW" ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent-400 align-middle" aria-label="New" /> : null}
                      {m.name}
                    </p>
                    <span className={`chip ${STATUS_STYLES[m.status]}`}>{statusLabel(m.status)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {m.organization || "Individual"} · {typeLabel(m.investorType)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString("en-GB")}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-3">
            {!active ? (
              <div className="card text-center !py-16">
                <p className="text-slate-500">Select an inquiry to review it.</p>
              </div>
            ) : (
              <article className="card !p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{active.name}</h2>
                    <p className="text-sm text-slate-400">
                      {typeLabel(active.investorType)} · {new Date(active.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <button type="button" onClick={remove} className="btn-ghost !border-red-500/30 !text-red-300 hover:!bg-red-500/10">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-300"><Mail className="h-4 w-4 text-slate-500" aria-hidden="true" /> <a className="hover:text-accent-300" href={`mailto:${active.email}`}>{active.email}</a></p>
                  {active.phone ? <p className="flex items-center gap-2 text-slate-300"><Phone className="h-4 w-4 text-slate-500" aria-hidden="true" /> {active.phone}</p> : null}
                  {active.organization ? <p className="flex items-center gap-2 text-slate-300"><Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" /> {active.organization}</p> : null}
                  {active.country ? <p className="flex items-center gap-2 text-slate-300"><Globe2 className="h-4 w-4 text-slate-500" aria-hidden="true" /> {active.country}</p> : null}
                  {active.interest ? <p className="mt-2 text-slate-400">Interest: <span className="text-slate-200">{active.interest}</span></p> : null}
                </div>

                {active.message ? (
                  <div className="mt-4 rounded-lg border border-slate-800 bg-ink-950/60 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{active.message}</p>
                  </div>
                ) : null}

                {active.ip ? <p className="mt-3 text-xs text-slate-500">Sent from {active.ip}{active.userAgent ? ` · ${active.userAgent.slice(0, 60)}` : ""}</p> : null}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
                  <span className="text-xs uppercase tracking-wider text-slate-500">Mark as</span>
                  {INVESTOR_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      disabled={updating || active.status === s.value}
                      onClick={() => setStatus(s.value)}
                      className={`btn-ghost !px-3 !py-1.5 text-xs ${active.status === s.value ? "!border-accent-500/40 !text-accent-300" : ""}`}
                    >
                      {updating ? <Loader2 className="mr-1 inline h-3 w-3 animate-spin" aria-hidden="true" /> : null}
                      {s.label}
                    </button>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </div>
  );
}