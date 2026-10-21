"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Mail,
  Phone,
  Building2,
  Globe2,
  Pin,
  Send,
  StickyNote,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";

interface Message {
  id: string;
  senderRole: "INVESTOR" | "ADMIN" | "SYSTEM";
  senderName: string;
  senderEmail: string | null;
  body: string;
  internal: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  kind: "INVESTOR" | "CONTACT";
  status: string;
  subject: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  participantOrg: string | null;
  participantCountry: string | null;
  investorType: string | null;
  portalToken: string;
  pinned: boolean;
  messages: Message[];
}

interface ConversationListItem {
  id: string;
  kind: "INVESTOR" | "CONTACT";
  status: string;
  subject: string;
  participantName: string;
  participantEmail: string;
  participantOrg: string | null;
  investorType: string | null;
  unreadForAdmin: boolean;
  pinned: boolean;
  lastMessageAt: string;
  messageCount: number;
  lastMessage: Message | null;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "!border-accent-500/40 !text-accent-300",
  PENDING: "!border-amber-500/40 !text-amber-300",
  CLOSED: "!border-emerald-500/40 !text-emerald-300",
  ARCHIVED: "!border-slate-700 !text-slate-500",
};

const STATUSES = ["OPEN", "PENDING", "CLOSED", "ARCHIVED"] as const;

export function AdminConversationsPage() {
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [counts, setCounts] = useState({ open: 0, unread: 0, total: 0 });
  const [filter, setFilter] = useState("");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [active, setActive] = useState<ConversationDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [internalNote, setInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ conversations: ConversationListItem[]; counts: typeof counts }>(
        "/api/admin/conversations",
        { status: filter, kind, q },
      );
      setItems(data.conversations);
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [filter, kind, q]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  async function openThread(id: string) {
    setLoadingThread(true);
    setNotice("");
    try {
      const detail = await apiGet<ConversationDetail>(`/api/admin/conversations/${id}`);
      setActive(detail);
      void load();
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to open conversation.");
    } finally {
      setLoadingThread(false);
    }
  }

  async function sendReply() {
    if (!active || replyBody.trim().length === 0) return;
    setSending(true);
    setNotice("");
    try {
      const res = await api<{ message: Message; emailSent: boolean }>(
        `/api/admin/conversations/${active.id}/messages`,
        { method: "POST", body: { body: replyBody.trim(), internal: internalNote } },
      );
      setActive({ ...active, messages: [...active.messages, res.message] });
      setReplyBody("");
      setNotice(
        internalNote
          ? "Internal note added."
          : res.emailSent
            ? "Reply sent by email."
            : "Reply saved. Email is not configured, so nothing was dispatched.",
      );
      void load();
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    } catch (err) {
      setNotice(err instanceof ClientError ? err.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  async function patchActive(patch: Record<string, unknown>) {
    if (!active) return;
    try {
      await api(`/api/admin/conversations/${active.id}`, { method: "PATCH", body: patch });
      setActive({ ...active, ...patch } as ConversationDetail);
      void load();
    } catch (err) {
      setNotice(err instanceof ClientError ? err.message : "Update failed.");
    }
  }

  const detail = useMemo(() => active, [active]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Communications</h1>
          <p className="mt-1 text-sm text-slate-400">
            Two-way threads with investors and contacts. Replies are emailed; the investor portal can be enabled in Security settings.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="chip !border-accent-500/40 !text-accent-300">{counts.unread} unread</span>
          <span className="chip">{counts.open} open</span>
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, subject…"
              className="input !w-44"
              aria-label="Search conversations"
            />
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="input !w-auto" aria-label="Filter by kind">
              <option value="">All</option>
              <option value="INVESTOR">Investors</option>
              <option value="CONTACT">Contacts</option>
            </select>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input !w-auto" aria-label="Filter by status">
              <option value="">Any status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <div className="card text-center !py-12">
              <p className="text-slate-400">No conversations match this view.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openThread(c.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      active?.id === c.id
                        ? "border-accent-500/50 bg-accent-500/10"
                        : "border-slate-800 bg-ink-900/40 hover:bg-ink-900/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-white">
                        {c.unreadForAdmin ? (
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent-400 align-middle" aria-label="Unread" />
                        ) : null}
                        {c.pinned ? <Pin className="mr-1 inline h-3.5 w-3.5 text-amber-300" aria-label="Pinned" /> : null}
                        {c.participantName}
                      </p>
                      <span className={`chip ${STATUS_STYLES[c.status] ?? ""}`}>{c.status}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-300">{c.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {c.lastMessage ? `${c.lastMessage.senderName}: ${c.lastMessage.body.slice(0, 60)}` : c.participantEmail}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(c.lastMessageAt).toLocaleString("en-GB")} · {c.messageCount} message{c.messageCount === 1 ? "" : "s"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {!detail ? (
            <div className="card text-center !py-16">
              <p className="text-slate-500">Select a conversation to read and reply.</p>
            </div>
          ) : (
            <article className="card flex max-h-[80vh] flex-col !p-0">
              <header className="border-b border-slate-800 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white">{detail.subject}</h2>
                    <p className="text-sm text-slate-400">
                      {detail.participantName}
                      {detail.participantOrg ? ` · ${detail.participantOrg}` : ""} ·{" "}
                      <span className="capitalize">{detail.kind.toLowerCase()}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => patchActive({ pinned: !detail.pinned })}
                      className={`btn-ghost !px-3 !py-1.5 text-xs ${detail.pinned ? "!border-amber-500/40 !text-amber-300" : ""}`}
                    >
                      <Pin className="h-3.5 w-3.5" aria-hidden="true" /> {detail.pinned ? "Pinned" : "Pin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => patchActive({ status: "CLOSED" })}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Close
                    </button>
                    <button
                      type="button"
                      onClick={() => patchActive({ status: "ARCHIVED" })}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> <a className="hover:text-accent-300" href={`mailto:${detail.participantEmail}`}>{detail.participantEmail}</a></span>
                  {detail.participantPhone ? <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" aria-hidden="true" /> {detail.participantPhone}</span> : null}
                  {detail.participantOrg ? <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" aria-hidden="true" /> {detail.participantOrg}</span> : null}
                  {detail.participantCountry ? <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> {detail.participantCountry}</span> : null}
                  {detail.investorType ? <span className="chip">{detail.investorType}</span> : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs uppercase tracking-wider text-slate-500">Status</span>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patchActive({ status: s })}
                      disabled={detail.status === s}
                      className={`btn-ghost !px-2.5 !py-1 text-[11px] ${detail.status === s ? STATUS_STYLES[s] : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                {loadingThread ? (
                  <p className="text-sm text-slate-400">Loading thread…</p>
                ) : (
                  detail.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-3.5 ${
                        m.internal
                          ? "border-amber-500/30 bg-amber-500/5"
                          : m.senderRole === "ADMIN"
                            ? "ml-6 border-accent-500/25 bg-accent-500/10"
                            : "mr-6 border-slate-800 bg-ink-950/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-200">
                          {m.senderName}
                          {m.internal ? <span className="ml-2 inline-flex items-center gap-1 text-amber-300"><StickyNote className="h-3 w-3" aria-hidden="true" /> internal note</span> : null}
                          {!m.internal && m.senderRole === "ADMIN" ? <span className="ml-2 text-accent-300">· team</span> : null}
                        </span>
                        <span className="text-slate-500">{new Date(m.createdAt).toLocaleString("en-GB")}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{m.body}</p>
                      {m.senderRole === "ADMIN" && !m.internal ? (
                        <p className="mt-1.5 text-[11px] text-slate-500">{m.emailSent ? "Emailed to participant" : "Saved (email not dispatched)"}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-800 p-4">
                {notice ? <p className="mb-2 text-xs text-slate-400">{notice}</p> : null}
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  placeholder={internalNote ? "Write an internal note (never emailed)…" : `Reply to ${detail.participantName}…`}
                  className="input !h-auto resize-y"
                  aria-label="Reply body"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={internalNote}
                      onChange={(e) => setInternalNote(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-ink-950"
                    />
                    Internal note (not sent to participant)
                  </label>
                  <button type="button" onClick={sendReply} disabled={sending || replyBody.trim().length === 0} className="btn-primary !px-4 !py-2 text-sm">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : internalNote ? <StickyNote className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                    {internalNote ? "Add note" : "Send reply"}
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
