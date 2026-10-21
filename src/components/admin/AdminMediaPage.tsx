"use client";

import { useEffect, useState } from "react";
import { Upload, Loader2, Trash2, Image as ImageIcon, FileImage } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  alt: string | null;
  createdAt: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setMedia(await apiGet<MediaItem[]>("/api/admin/media"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api("/api/admin/media", { formData: fd });
      await load();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(item: MediaItem) {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await api(`/api/admin/media/${item.id}`, { method: "DELETE" });
      setMedia((list) => list.filter((m) => m.id !== item.id));
    } catch (err) {
      alert(err instanceof ClientError ? err.message : "Delete failed.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Media Library</h1>
          <p className="mt-1 text-sm text-slate-400">
            {media.length} image{media.length === 1 ? "" : "s"} — used across projects and achievements.
          </p>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload image
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : media.length === 0 ? (
        <div className="card text-center !py-16">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-600" aria-hidden="true" />
          <p className="mt-3 text-slate-400">No media yet. Upload your first image above.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="card overflow-hidden !p-0">
              <div className="relative aspect-video bg-ink-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? m.originalName} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={deletingId === m.id}
                  className="absolute right-2 top-2 rounded-lg bg-ink-950/80 p-2 text-slate-300 opacity-90 transition-colors hover:text-red-300 disabled:opacity-50"
                  aria-label={`Delete ${m.originalName}`}
                >
                  {deletingId === m.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="space-y-1 p-3">
                <p className="flex items-center gap-1.5 truncate text-xs font-medium text-slate-200" title={m.originalName}>
                  <FileImage className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                  {m.originalName}
                </p>
                <p className="text-xs text-slate-500">
                  {m.width && m.height ? `${m.width}×${m.height}` : "Image"} · {formatBytes(m.size)}
                </p>
                <p className="truncate text-xs text-slate-600">{m.url}</p>
                <p className="text-xs text-slate-600">{new Date(m.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}