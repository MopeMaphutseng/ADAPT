"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api, ClientError } from "@/lib/client";
import { Field, Toggle } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/constants";
import type { Achievement } from "@prisma/client";

const blank = {
  title: "",
  slug: "",
  description: "",
  content: "",
  category: "MONTHLY",
  occurredOn: new Date().toISOString().slice(0, 10),
  coverImage: "",
  videoUrl: "",
  externalUrl: "",
  author: "",
  featured: false,
  published: true,
  publishedAt: "",
  order: 0,
};

export function AchievementForm({ initial }: { initial?: Achievement }) {
  const router = useRouter();
  const [f, setF] = useState(() => {
    if (!initial) return blank;
    return {
      title: initial.title,
      slug: initial.slug,
      description: initial.description,
      content: initial.content,
      category: initial.category,
      occurredOn: initial.occurredOn.toISOString().slice(0, 10),
      coverImage: initial.coverImage ?? "",
      videoUrl: initial.videoUrl ?? "",
      externalUrl: initial.externalUrl ?? "",
      author: initial.author ?? "",
      featured: initial.featured,
      published: initial.published,
      publishedAt: initial.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0, 16) : "",
      order: initial.order,
    };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = { ...f, publishedAt: f.publishedAt || null };
    try {
      if (initial) {
        await api(`/api/admin/achievements/${initial.id}`, { method: "PUT", body: payload });
      } else {
        await api("/api/admin/achievements", { body: payload });
      }
      router.push("/admin/achievements");
      router.refresh();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const inputCls = "input";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/achievements" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to achievements
        </Link>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {initial ? f.published ? "Save & Publish" : "Save changes" : f.published ? "Publish achievement" : "Save achievement"}
        </button>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Field id="a-title" label="Title" required>
          <input id="a-title" className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field id="a-slug" label="Slug (URL)" hint="Auto-generated from the title if left blank.">
          <input id="a-slug" className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <Field id="a-category" label="Category">
          <select id="a-category" className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value as never)}>
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field id="a-date" label="Date of achievement" required>
          <input id="a-date" type="date" className={inputCls} value={f.occurredOn} onChange={(e) => set("occurredOn", e.target.value)} required />
        </Field>
        <Field id="a-desc" label="Short description" required hint="Card summary. Max 600 characters.">
          <textarea id="a-desc" rows={2} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} required maxLength={600} />
        </Field>
        <Field id="a-author" label="Author" hint="Defaults to the signed-in user.">
          <input id="a-author" className={inputCls} value={f.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
      </div>

      <Field id="a-content" label="Full content" required>
        <textarea id="a-content" rows={10} className={inputCls} value={f.content} onChange={(e) => set("content", e.target.value)} required />
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <MediaPicker id="a-cover" label="Featured image" value={f.coverImage} onChange={(url) => set("coverImage", url)} />
        <div className="space-y-5">
          <Field id="a-video" label="Video URL" hint="Optional YouTube/Vimeo or direct link.">
            <input id="a-video" type="url" className={inputCls} value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <Field id="a-external" label="External link" hint="Optional — a company page, article or launch link.">
            <input id="a-external" type="url" className={inputCls} value={f.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <Field id="a-order" label="Display order">
            <input id="a-order" type="number" className={inputCls} value={f.order} onChange={(e) => set("order", Number(e.target.value) || 0)} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Toggle id="a-featured" label="Featured" checked={f.featured} onChange={(v) => set("featured", v)} hint="Featured achievements appear on the home page." />
        <Toggle id="a-published" label="Published" checked={f.published} onChange={(v) => set("published", v)} hint="When on, this achievement appears on the public site immediately." />
      </div>

      <Field id="a-pubdate" label="Publish / schedule date" hint='Use "Publish Now" (leave blank) or set a future date to schedule publication.'>
        <input id="a-pubdate" type="datetime-local" className={inputCls} value={f.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/achievements" className="btn-ghost">Cancel</Link>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {initial ? "Save changes" : f.published ? "Publish achievement" : "Save achievement"}
        </button>
      </div>
    </form>
  );
}