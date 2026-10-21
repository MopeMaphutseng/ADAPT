"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Mail, Phone, Building2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { MESSAGE_STATUSES, INQUIRY_TYPES } from "@/lib/constants";
import type { ContactMessage } from "@prisma/client";

const STATUS_STYLES: Record<string, string> = {
  NEW: "!border-accent-500/40 !text-accent-300",
  READ: "!border-slate-600 !text-slate-300",
  RESPONDED: "!border-emerald-500/40 !text-emerald-300",
  CLOSED: "!border-slate-700 !text-slate-500",
};

export function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [active, setActive] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const list = await apiGet<ContactMessage[]>("/api/admin/messages", { status: filter, q });
      setItems(list);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q]);

  async function open(m: ContactMessage) {
    setSelectedId(m.id);
    setActive(m);
    if (m.status === "NEW") {
      try {
        const updated = await api<ContactMessage>(`/api/admin/messages/${m.id}`, { method: "PATCH", body: { status: "READ" } });
        setActive(updated);
        await load();
      } catch {
        /* keep local view */
      }
    }
  }

  async function setStatus(status: string) {
    if (!active) return;
    setUpdating(true);
    try {
      const updated = await api<ContactMessage>(`/api/admin/messages/${active.id}`, { method: "PATCH", body: { status } });
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
    if (!confirm("Delete this message permanently?")) return;
    try {
      await api(`/api/admin/messages/${active.id}`, { method: "DELETE" });
      setActive(null);
      setSelectedId(null);
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    }
  }

  const statusLabel = (s: string) => MESSAGE_STATUSES.find((x) => x.value === s)?.label ?? s;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">Contact form submissions from the website.</p>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setLoading(true); }}
          placeholder="Search name, email, subject…"
          className="input !w-64"
          aria-label="Search messages"
        />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setLoading(true); }} className="input !w-auto" aria-label="Filter by status">
          <option value="">All statuses</option>
          {MESSAGE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{items.length} message{items.length === 1 ? "" : "s"}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card text-center !py-14">
          <p className="text-slate-400">No messages match this view.</p>
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
                      {m.status === "NEW" ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent-400 align-middle" aria-label="Unread" /> : null}
                      {m.name}
                    </p>
                    <span className={`chip ${STATUS_STYLES[m.status]}`}>{statusLabel(m.status)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {m.subject} — {m.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString("en-GB")}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-3">
            {!active ? (
              <div className="card text-center !py-16">
                <p className="text-slate-500">Select a message to read it.</p>
              </div>
            ) : (
              <article className="card !p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{active.subject}</h2>
                    <p className="text-sm text-slate-400">
                      From <span className="text-white">{active.name}</span> · {new Date(active.createdAt).toLocaleString("en-GB")}
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
                  {active.inquiryType ? (
                    <p className="text-slate-400">Inquiry type: <span className="text-slate-200">{INQUIRY_TYPES.find((t) => t.value === active.inquiryType)?.label ?? active.inquiryType}</span></p>
                  ) : null}
                </div>

                <div className="mt-4 rounded-lg border border-slate-800 bg-ink-950/60 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{active.message}</p>
                </div>

                {active.ip ? <p className="mt-3 text-xs text-slate-500">Sent from {active.ip}{active.userAgent ? ` · ${active.userAgent.slice(0, 60)}` : ""}</p> : null}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
                  <span className="text-xs uppercase tracking-wider text-slate-500">Mark as</span>
                  {MESSAGE_STATUSES.map((s) => (
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