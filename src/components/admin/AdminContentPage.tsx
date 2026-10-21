"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { Field, Toggle, TextList } from "@/components/admin/fields";

type SiteContent = Record<string, any>;
type SectionValue = Record<string, any>;

interface SectionSpec {
  key: string;
  title: string;
  description: string;
  fields: { name: string; label: string; type?: "text" | "textarea" | "list"; hint?: string }[];
}

const SECTIONS: SectionSpec[] = [
  {
    key: "company",
    title: "Company",
    description: "Brand identity and company-level copy.",
    fields: [
      { name: "name", label: "Company name" },
      { name: "tagline", label: "Tagline" },
      { name: "brandStatement", label: "Brand statement", type: "textarea" },
      { name: "localTalent", label: "Local talent line" },
      { name: "philosophy", label: "Philosophy" },
      { name: "longVision", label: "Long vision", type: "textarea" },
      { name: "position", label: "Positioning line" },
      { name: "location", label: "Location" },
      { name: "email", label: "Email" },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "heroSupport", label: "Hero support line", type: "textarea" },
      { name: "vision", label: "Vision statement", type: "textarea" },
    ],
  },
  {
    key: "founder",
    title: "Founder",
    description: "Founder identity, bio and highlights.",
    fields: [
      { name: "name", label: "Name" },
      { name: "title", label: "Title" },
      { name: "company", label: "Company" },
      { name: "email", label: "Email" },
      { name: "location", label: "Location" },
      { name: "image", label: "Image URL", hint: "Optional portrait for the About page." },
      { name: "bio", label: "Biography", type: "textarea" },
      { name: "highlights", label: "Highlights / skills", type: "list" },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    description: "Contact page fallback details.",
    fields: [
      { name: "company", label: "Company" },
      { name: "founderName", label: "Founder name" },
      { name: "founderTitle", label: "Founder title" },
      { name: "email", label: "Email" },
      { name: "location", label: "Location" },
      { name: "thankyou", label: "Thank-you message", type: "textarea" },
    ],
  },
  {
    key: "social",
    title: "Social Links",
    description: "Profile URLs for the footer. Leave blank to hide.",
    fields: [
      { name: "linkedin", label: "LinkedIn", hint: "https://linkedin.com/…" },
      { name: "x", label: "X (Twitter)", hint: "https://x.com/…" },
      { name: "facebook", label: "Facebook", hint: "https://facebook.com/…" },
      { name: "instagram", label: "Instagram", hint: "https://instagram.com/…" },
      { name: "tiktok", label: "TikTok", hint: "https://tiktok.com/…" },
      { name: "youtube", label: "YouTube", hint: "https://youtube.com/…" },
      { name: "github", label: "GitHub", hint: "https://github.com/…" },
    ],
  },
  {
    key: "home",
    title: "Home Page",
    description: "Hero and vision copy on the home page.",
    fields: [
      { name: "heroEyebrow", label: "Hero eyebrow" },
      { name: "heroTitle", label: "Hero title" },
      { name: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
      { name: "heroSupport", label: "Hero support line", type: "textarea" },
      { name: "visionTitle", label: "Vision title" },
      { name: "visionText", label: "Vision text", type: "textarea" },
    ],
  },
  {
    key: "investor",
    title: "Investor",
    description: "Investor page headline, positioning and opportunities.",
    fields: [
      { name: "headline", label: "Headline" },
      { name: "subhead", label: "Subheadline", type: "textarea" },
      { name: "whyAdapt", label: "Why invest in ADAPT", type: "list" },
      { name: "whatWeAreBuilding", label: "What we are building", type: "list" },
      { name: "useOfFunds", label: "Use of funds", type: "list" },
      { name: "ctaTitle", label: "CTA title" },
      { name: "ctaBody", label: "CTA body", type: "textarea" },
    ],
  },
  {
    key: "roadmap",
    title: "Roadmap",
    description: "Phase labels and focus areas for the investor roadmap.",
    fields: [{ name: "phases", label: "Phases (JSON)", type: "textarea", hint: 'Array of { key, label, title, items } — edit carefully.' }],
  },
  {
    key: "legal",
    title: "Legal",
    description: "Privacy, Terms and Cookie policy body text.",
    fields: [
      { name: "privacy", label: "Privacy Policy", type: "textarea" },
      { name: "terms", label: "Terms of Service", type: "textarea" },
      { name: "cookies", label: "Cookie Policy", type: "textarea" },
    ],
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Optional privacy-friendly analytics embedding.",
    fields: [
      { name: "provider", label: "Provider", hint: "e.g. Plausible, Umami, Fathom" },
      { name: "scriptId", label: "Script ID / dataset domain", hint: "" },
    ],
  },
];

function renderField(
  spec: SectionSpec,
  section: SectionValue,
  field: SectionSpec["fields"][number],
  nestedKey: string | null,
  patch: (path: string, value: unknown) => void,
) {
  const path = (field.name === "phases" && nestedKey) ? nestedKey : field.name;
  const value = section[path] ?? "";
  const textValue =
    (typeof value === "object" && value !== null)
      ? JSON.stringify(value, null, 2)
      : field.type === "list"
        ? Array.isArray(value) ? value.join("\n") : String(value ?? "")
        : String(value ?? "");

  if (field.type === "textarea") {
    return (
      <Field key={path} id={`${spec.key}-${path}`} label={field.label} hint={field.hint}>
        <textarea id={`${spec.key}-${path}`} rows={field.name === "phases" ? 8 : 3} className="input font-mono text-xs" value={textValue} onChange={(e) => patch(path, e.target.value)} />
      </Field>
    );
  }

  if (field.type === "list") {
    return (
      <TextList
        key={path}
        id={path}
        label={field.label}
        values={Array.isArray(value) ? value : []}
        onChange={(v: string[]) => patch(path, v)}
      />
    );
  }

  return (
    <Field key={path} id={`${spec.key}-${path}`} label={field.label} hint={field.hint}>
      <input id={`${spec.key}-${path}`} className="input" value={textValue} onChange={(e) => patch(path, e.target.value)} />
    </Field>
  );
}

function SectionPanel({ spec, section, onPatch }: { spec: SectionSpec; section: SectionValue; onPatch: (patch: Record<string, unknown>) => void }) {
  const patch = (path: string, value: unknown) => onPatch({ [path]: value });
  const nestedPath = spec.key === "roadmap" ? (section.phases ? "phases" : null) : null;

  if (spec.key === "investor") {
    return (
      <div className="space-y-5">
        {spec.fields.map((f) =>
          f.name.startsWith("opportunities") ? null : renderField(spec, section, f, null, patch),
        )}
        <div className="rounded-lg border border-slate-800 bg-ink-900/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Opportunity details</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {Object.entries((section.opportunities as Record<string, string>) ?? {}).map(([k, v]) => (
              <Field key={k} id={`investor-opp-${k}`} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} hint="Leave blank if not disclosed.">
                <input id={`investor-opp-${k}`} className="input" value={String(v ?? "")} onChange={(e) => patch("opportunities", { ...(section.opportunities ?? {}), [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {spec.fields.map((f) =>
        f.name === "phases" && !nestedPath
          ? renderField(spec, section, f, nestedPath, patch)
          : renderField(spec, section, f, null, patch),
      )}
    </div>
  );
}

export function AdminContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<string>(SECTIONS[0].key);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  async function load() {
    try {
      setContent(await apiGet<SiteContent>("/api/admin/settings"));
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Failed to load content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!content) return;
    setSaving(true);
    setError("");
    setSaveMsg("");
    try {
      const { analytics, ...rest } = content;
      const patchValue: Record<string, unknown> = { ...rest[tab] };
      if (tab === "roadmap" && typeof patchValue.phases === "string") {
        try {
          patchValue.phases = JSON.parse(patchValue.phases as string);
        } catch {
          setError("Roadmap phases must be valid JSON.");
          setSaving(false);
          return;
        }
      }
      if (tab === "analytics") {
        patchValue.enabled = (rest as any).analytics?.enabled ?? false;
        patchValue.provider = (rest as any).analytics?.provider ?? "";
        patchValue.scriptId = (rest as any).analytics?.scriptId ?? "";
      }
      await api("/api/admin/settings", { method: "PUT", body: { key: tab, value: patchValue } });
      setSaveMsg("Saved.");
      await load();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const section = content ? (content[tab] as SectionValue) : null;
  const analytics = content?.analytics;

  function patchLocal(patch: Record<string, unknown>) {
    if (!content) return;
    setContent((c) => ({ ...c!, [tab]: { ...(c![tab] as SectionValue), ...patch } }));
  }

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (!content) return <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error || "No content."}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Site Content</h1>
          <p className="mt-1 text-sm text-slate-400">Editable copy shown across the public site. Saving applies to the current section.</p>
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save {SECTIONS.find((s) => s.key === tab)?.title}
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p> : null}
      {saveMsg ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{saveMsg}</p> : null}

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setTab(s.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === s.key ? "bg-accent-500/15 text-white ring-1 ring-accent-500/40" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="card max-w-3xl !p-6">
        {section ? (
          <>
            <p className="mb-5 text-sm text-slate-400">{SECTIONS.find((s) => s.key === tab)?.description}</p>
            <SectionPanel spec={SECTIONS.find((s) => s.key === tab)!} section={section} onPatch={patchLocal} />
            {tab === "analytics" && analytics ? (
              <div className="mt-4">
                <Toggle
                  id="analytics-enabled"
                  label="Analytics enabled"
                  checked={analytics.enabled}
                  onChange={(v) => setContent((c) => ({ ...c!, analytics: { ...c!.analytics, enabled: v } }))}
                />
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-slate-400">No content loaded for this section.</p>
        )}
      </div>
    </div>
  );
}