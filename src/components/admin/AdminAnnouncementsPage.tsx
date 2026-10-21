"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Pin, PinOff, Loader2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { Field, Toggle } from "@/components/admin/fields";
import { PublishState } from "@/components/ui/Cards";
import type { Announcement } from "@prisma/client";

const blank = { title: "", body: "", pinned: false, published: false };

type Draft = typeof blank & { slug?: string };

export function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems(await apiGet<Announcement[]>("/api/admin/announcements"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setEditingId(null);
    setDraft(blank);
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setDraft({
      title: a.title,
      body: a.body,
      slug: a.slug,
      pinned: a.pinned,
      published: a.published,
    });
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api(`/api/admin/announcements/${editingId}`, { method: "PUT", body: draft });
      } else {
        await api("/api/admin/announcements", { body: draft });
      }
      startNew();
      await load();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: Announcement) {
    if (!confirm(`Delete announcement "${a.title}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/announcements/${a.id}`, { method: "DELETE" });
      if (editingId === a.id) startNew();
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    }
  }

  async function togglePin(a: Announcement) {
    try {
      await api(`/api/admin/announcements/${a.id}`, {
        method: "PUT",
        body: { title: a.title, body: a.body, slug: a.slug, pinned: !a.pinned, published: a.published },
      });
      await load();
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Update failed.");
    }
  }

  const inputCls = "input";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Announcements</h1>
          <p className="mt-1 text-sm text-slate-400">Short updates shown site-wide or on relevant pages.</p>
        </div>
        <button type="button" onClick={startNew} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New announcement
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Editor */}
        <form onSubmit={save} className="card space-y-4 self-start lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {editingId ? "Edit announcement" : "New announcement"}
          </h2>
          <Field id="an-title" label="Title" required>
            <input id="an-title" className={inputCls} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} required />
          </Field>
          <Field id="an-body" label="Message" required>
            <textarea id="an-body" rows={6} className={inputCls} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle id="an-pinned" label="Pinned" checked={draft.pinned} onChange={(v) => setDraft((d) => ({ ...d, pinned: v }))} />
            <Toggle id="an-pub" label="Published" checked={draft.published} onChange={(v) => setDraft((d) => ({ ...d, published: v }))} hint="Published immediately." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={startNew} className="btn-ghost">Clear</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {editingId ? "Save changes" : "Create announcement"}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-3 lg:col-span-3">
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <div className="card text-center !py-14">
              <p className="text-slate-400">No announcements yet.</p>
            </div>
          ) : (
            items.map((a) => (
              <article key={a.id} className={`card !p-4 ${editingId === a.id ? "ring-1 ring-accent-500/40" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-white">{a.title}</h3>
                      {a.pinned ? (
                        <span className="chip !border-accent-500/40 !text-accent-300">
                          <Pin className="mr-1 inline h-3 w-3" aria-hidden="true" />Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{a.body}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => togglePin(a)}
                      title={a.pinned ? "Unpin" : "Pin"}
                      className="rounded-lg p-2 text-slate-400 hover:text-white"
                      aria-label={a.pinned ? `Unpin ${a.title}` : `Pin ${a.title}`}
                    >
                      {a.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="rounded-lg p-2 text-slate-400 hover:text-white"
                      aria-label={`Edit ${a.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(a)}
                      className="rounded-lg p-2 text-slate-400 hover:text-red-300"
                      aria-label={`Delete ${a.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <PublishState published={a.published} publishedAt={a.publishedAt} />
                  <span>Updated {new Date(a.updatedAt).toLocaleString("en-GB")}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}