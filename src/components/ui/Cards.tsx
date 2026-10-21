import Link from "next/link";
import { ImageOff, ArrowRight, Play } from "lucide-react";
import { PROJECT_STATUSES, ACHIEVEMENT_CATEGORIES } from "@/lib/constants";
import type { Project, Achievement } from "@prisma/client";
import { VideoBackdrop, isLocalVideo } from "@/components/ui/VideoPlayer";

function VideoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyanx-400/40 bg-ink-950/70 px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-cyanx backdrop-blur">
      <Play className="h-3 w-3" aria-hidden="true" />
      Video
    </span>
  );
}

export function StatusBadge({ status, publishState }: { status: string; publishState?: string }) {
  const map: Record<string, string> = {
    IDEA: "bg-slate-400/10 text-slate-300 border-white/15",
    RESEARCH: "bg-sky-400/10 text-sky-300 border-sky-400/30",
    PROTOTYPE: "bg-violet-400/10 text-violetx-300 border-violetx-400/30",
    DEVELOPMENT: "bg-accent-500/15 text-accent-300 border-accent-500/40",
    TESTING: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    BETA: "bg-orange-400/10 text-orange-300 border-orange-400/30",
    PRODUCTION: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    COMPLETED: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    PUBLISHED: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    DRAFT: "bg-slate-400/10 text-slate-400 border-white/15",
    SCHEDULED: "bg-indigo-400/10 text-indigo-300 border-indigo-400/30",
  };
  const cls = map[status] ?? map.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider ${cls}`}>
      {status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())}
      {publishState ? ` · ${publishState}` : ""}
    </span>
  );
}

export function PublishState({ published, publishedAt }: { published: boolean; publishedAt: Date | string | null }) {
  if (!published) return <StatusBadge status="DRAFT" />;
  const at = publishedAt ? new Date(publishedAt) : null;
  if (at && at.getTime() > Date.now()) return <StatusBadge status="SCHEDULED" />;
  return <StatusBadge status="PUBLISHED" />;
}

function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProjectCard({ project }: { project: Project }) {
  const statusLabel =
    PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status;
  const href = `/projects/${project.slug}`;
  return (
    <article className="card hud-frame card-grid group flex h-full flex-col overflow-hidden !p-0">
      <Link href={href} aria-label={project.title} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900">
          {project.videoUrl && isLocalVideo(project.videoUrl) ? (
            <VideoBackdrop
              src={project.videoUrl}
              poster={project.coverImage}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImage}
              alt={`${project.title} cover`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900 text-slate-500">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <StatusBadge status={project.status} />
          </div>
          {project.videoUrl ? (
            <div className="absolute right-3 top-3">
              <VideoBadge />
            </div>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-slate-400">
            {project.category ?? "project"}
          </span>
          <span className="font-mono text-[0.75rem] text-slate-500">
            {String(formatDate(project.publishedAt ?? project.updatedAt))}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white">
          <Link href={href} className="transition-colors group-hover:text-cyanx">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-slate-400">{project.summary}</p>
        {project.technologies.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((t) => (
              <span key={t} className="chip !bg-white/[0.03] !border-white/10">{t}</span>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
          <span className="font-mono text-[0.7rem] tracking-widest text-slate-400">INSPECT</span>
          <Link
            href={project.externalUrl ?? href}
            {...(project.externalUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyanx transition-colors hover:text-white"
          >
            {project.externalUrl ? "Demo" : "View"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const categoryLabel =
    ACHIEVEMENT_CATEGORIES.find((c) => c.value === achievement.category)?.label ?? achievement.category;
  const href = `/achievements/${achievement.slug}`;
  return (
    <article className="card hud-frame card-grid group flex h-full flex-col overflow-hidden !p-0">
      <Link href={href} aria-label={achievement.title} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900">
          {achievement.videoUrl && isLocalVideo(achievement.videoUrl) ? (
            <VideoBackdrop
              src={achievement.videoUrl}
              poster={achievement.coverImage}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : achievement.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={achievement.coverImage}
              alt={`${achievement.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900 text-slate-500">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full border border-cyanx-400/30 bg-cyanx-400/10 px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-cyanx">
              {categoryLabel}
            </span>
          </div>
          {achievement.videoUrl ? (
            <div className="absolute right-3 top-3">
              <VideoBadge />
            </div>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-slate-400">
            milestone
          </span>
          <span className="font-mono text-[0.75rem] text-slate-500">{formatDate(achievement.occurredOn)}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">
          <Link href={href} className="transition-colors group-hover:text-cyanx">
            {achievement.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-slate-400">{achievement.description}</p>
        {achievement.author ? (
          <p className="mt-4 font-mono text-[0.7rem] tracking-widest text-slate-400">
            {achievement.author.toUpperCase()}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-end border-t border-white/[0.08] pt-4">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyanx transition-colors hover:text-white"
          >
            Read the log
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}