"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";

interface MediaItem {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
}

export function MediaPicker({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<MediaItem[]>("/api/admin/media")
      .then((items) => setMedia(items))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const item = await api<MediaItem>("/api/admin/media", { formData: fd });
      setMedia((list) => [item, ...list]);
      onChange(item.url);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const selected = value;

  return (
    <div>
      <span className="label">{label}</span>
      <div className="rounded-lg border border-slate-800 bg-ink-900 p-3">
        <div className="flex items-center gap-3">
          <label className="btn-secondary cursor-pointer !px-3 !py-2 text-xs">
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
          <div className="min-w-0 flex-1">
            <input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image URL"
              className="input !py-2 text-xs"
            />
          </div>
        </div>

        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Media library {loading ? "(loading…)" : `(${media.length})`}
          </p>
          {loading ? null : media.length > 0 ? (
            <div className="mt-2 grid grid-cols-6 gap-2">
              {media.slice(0, 12).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange(m.url)}
                  aria-label={`Select ${m.alt ?? "image"}`}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selected === m.url ? "border-accent-500" : "border-slate-800 hover:border-slate-600"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt ?? "media thumbnail"} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-600">No media uploaded yet. Upload from the Media page or here.</p>
          )}
        </div>
        {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}