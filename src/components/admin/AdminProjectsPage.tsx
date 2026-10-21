"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { PublishState } from "@/components/ui/Cards";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project } from "@prisma/client";

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    try {
      setProjects(await apiGet<Project[]>("/api/admin/projects"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(project: Project) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setBusyId(project.id);
    try {
      await api(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      setProjects((list) => list.filter((p) => p.id !== project.id));
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    } finally {
      setBusyId("");
    }
  }

  const label = (status: string) =>
    PROJECT_STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            {projects.length} project{projects.length === 1 ? "" : "s"} in the portfolio.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New project
        </Link>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="card text-center !py-14">
          <p className="text-slate-400">No projects yet. Create your first project.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-ink-900/70">
                <tr>
                  <th className="table-th">Project</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Visibility</th>
                  <th className="table-th">Updated</th>
                  <th className="table-th text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projects.map((p) => (
                  <tr key={p.id} className="bg-ink-900/30 hover:bg-ink-900/60">
                    <td className="table-td font-medium text-white">{p.title}</td>
                    <td className="table-td"><StatusPill status={label(p.status)} /></td>
                    <td className="table-td">{p.category}</td>
                    <td className="table-td"><PublishState published={p.published} publishedAt={p.publishedAt} /></td>
                    <td className="table-td">{new Date(p.updatedAt).toLocaleDateString("en-GB")}</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        {p.externalUrl ? (
                          <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-slate-400 hover:text-white" aria-label="Open external link">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                        <Link href={`/admin/projects/${p.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:text-white" aria-label={`Edit ${p.title}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          className="rounded-lg p-2 text-slate-400 hover:text-red-300 disabled:opacity-50"
                          aria-label={`Delete ${p.title}`}
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

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs text-slate-300">
      {status}
    </span>
  );
}