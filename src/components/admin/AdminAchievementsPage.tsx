"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { PublishState } from "@/components/ui/Cards";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/constants";
import type { Achievement } from "@prisma/client";

export function AdminAchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    try {
      setItems(await apiGet<Achievement[]>("/api/admin/achievements"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(item: Achievement) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      await api(`/api/admin/achievements/${item.id}`, { method: "DELETE" });
      setItems((list) => list.filter((a) => a.id !== item.id));
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    } finally {
      setBusyId("");
    }
  }

  const catLabel = (c: string) => ACHIEVEMENT_CATEGORIES.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Achievements</h1>
          <p className="mt-1 text-sm text-slate-400">
            {items.length} achievement{items.length === 1 ? "" : "s"} — milestones, launches, news.
          </p>
        </div>
        <Link href="/admin/achievements/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New achievement
        </Link>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card text-center !py-14">
          <p className="text-slate-400">No achievements yet. Document your first milestone.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-ink-900/70">
                <tr>
                  <th className="table-th">Achievement</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Visibility</th>
                  <th className="table-th"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((a) => (
                  <tr key={a.id} className="bg-ink-900/30 hover:bg-ink-900/60">
                    <td className="table-td font-medium text-white">{a.title}</td>
                    <td className="table-td">{catLabel(a.category)}</td>
                    <td className="table-td">{new Date(a.occurredOn).toLocaleDateString("en-GB")}</td>
                    <td className="table-td"><PublishState published={a.published} publishedAt={a.publishedAt} /></td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/achievements/${a.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:text-white" aria-label={`Edit ${a.title}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(a)}
                          disabled={busyId === a.id}
                          className="rounded-lg p-2 text-slate-400 hover:text-red-300 disabled:opacity-50"
                          aria-label={`Delete ${a.title}`}
                        >
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