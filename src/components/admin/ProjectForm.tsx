"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api, ClientError } from "@/lib/client";
import { Field, Toggle, TextList } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project } from "@prisma/client";

const blank = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  status: "IDEA",
  category: "",
  technologies: [""],
  coverImage: "",
  videoUrl: "",
  externalUrl: "",
  featured: false,
  published: true,
  publishedAt: "",
  order: 0,
};

export function ProjectForm({ initial }: { initial?: Project }) {
  const router = useRouter();
  const [f, setF] = useState(() => {
    if (!initial) return blank;
    return {
      title: initial.title,
      slug: initial.slug,
      summary: initial.summary,
      description: initial.description,
      status: initial.status,
      category: initial.category === "Technology" ? "" : initial.category,
      technologies: initial.technologies.length ? initial.technologies : [""],
      coverImage: initial.coverImage ?? "",
      videoUrl: initial.videoUrl ?? "",
      externalUrl: initial.externalUrl ?? "",
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
    const payload = {
      ...f,
      category: f.category || "Technology",
      technologies: f.technologies.map((t) => t.trim()).filter(Boolean),
      publishedAt: f.publishedAt || null,
    };
    try {
      if (initial) {
        await api(`/api/admin/projects/${initial.id}`, { method: "PUT", body: payload });
      } else {
        await api("/api/admin/projects", { body: payload });
      }
      router.push("/admin/projects");
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
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to projects
        </Link>
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {initial ? f.published ? "Save & Publish" : "Save changes" : f.published ? "Publish project" : "Save project"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Field id="p-title" label="Project title" required>
          <input id="p-title" className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field id="p-slug" label="Slug (URL)" hint="Auto-generated from the title if left blank.">
          <input id="p-slug" className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="my-project" />
        </Field>
        <Field id="p-status" label="Status">
          <select id="p-status" className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value as never)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field id="p-category" label="Category" hint="e.g. AI & Software, Robotics, Energy Technology.">
          <input id="p-category" className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)} />
        </Field>
        <Field id="p-summary" label="Summary" required hint="Short description shown on cards. Max 600 characters.">
          <textarea id="p-summary" rows={2} className={inputCls} value={f.summary} onChange={(e) => set("summary", e.target.value)} required maxLength={600} />
        </Field>
        <TextList id="p-tech" label="Technologies" values={f.technologies} onChange={(v) => set("technologies", v)} placeholder="e.g. Artificial Intelligence" />
      </div>

      <Field id="p-desc" label="Full description" required>
        <textarea id="p-desc" rows={10} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} required />
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <MediaPicker id="p-cover" label="Cover image" value={f.coverImage} onChange={(url) => set("coverImage", url)} hint="Upload from the media library or paste a public URL." />
        <div className="space-y-5">
          <Field id="p-video" label="Video URL">
            <input id="p-video" type="url" className={inputCls} value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <Field id="p-external" label="External link (demo / live)" hint="e.g. the live demo URL.">
            <input id="p-external" type="url" className={inputCls} value={f.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <Field id="p-order" label="Display order" hint="Lower numbers appear first.">
            <input id="p-order" type="number" className={inputCls} value={f.order} onChange={(e) => set("order", Number(e.target.value) || 0)} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Toggle id="p-featured" label="Featured project" checked={f.featured} onChange={(v) => set("featured", v)} hint="Shown prominently on the home page." />
        <Toggle id="p-published" label="Published" checked={f.published} onChange={(v) => set("published", v)} hint="When on, this project appears on the public site immediately." />
      </div>

      <Field id="p-pubdate" label="Publish / schedule date" hint="Leave blank for immediate publication when “Published” is enabled.">
        <input id="p-pubdate" type="datetime-local" className={inputCls} value={f.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/projects" className="btn-ghost">Cancel</Link>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {initial ? "Save changes" : f.published ? "Publish project" : "Save project"}
        </button>
      </div>
    </form>
  );
}