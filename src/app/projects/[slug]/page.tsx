import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink, Video } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { PROJECT_STATUSES } from "@/lib/constants";
import { VideoPlayer, isLocalVideo } from "@/components/ui/VideoPlayer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { title: true, summary: true, coverImage: true },
  });
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${slug}`,
    image: project.coverImage ?? undefined,
    type: "article",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project || !project.published) {
    notFound();
  }
  if (project.publishedAt && project.publishedAt.getTime() > Date.now()) {
    notFound();
  }

  void prisma.project.update({ where: { id: project.id }, data: { views: { increment: 1 } } });

  const statusLabel = PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status;
  const gallery: { url: string; alt?: string }[] = Array.isArray(project.gallery)
    ? (project.gallery as { url: string; alt?: string }[])
    : [];

  return (
    <article>
      <header className="relative overflow-hidden border-b border-slate-800/60">
        {project.coverImage ? (
          <div className="absolute inset-0" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverImage} alt="" className="h-full w-full object-cover opacity-20 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
          </div>
        ) : null}
        <div className="container-page relative py-16 sm:py-20">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="chip">{statusLabel}</span>
            <span className="chip">{project.category}</span>
            <span className="chip">
              {project.publishedAt
                ? new Date(project.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : ""}
            </span>
          </div>
          <h1 className="h-display mt-4 max-w-3xl">{project.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{project.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {project.externalUrl ? (
              <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open project / demo
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            {project.videoUrl && !isLocalVideo(project.videoUrl) ? (
              <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <Video className="h-4 w-4" aria-hidden="true" />
                Watch video
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_0.9fr]">
          <div>
            {project.videoUrl && isLocalVideo(project.videoUrl) ? (
              <VideoPlayer
                src={project.videoUrl}
                title={`${project.title} — project footage`}
                poster={project.coverImage}
                className="mb-10"
              />
            ) : null}

            {project.coverImage ? (
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.coverImage}
                  alt={`${project.title} — featured image`}
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-800 bg-ink-900 text-slate-400">
                <span className="font-mono text-[0.8125rem] tracking-[0.28em]">IMAGE PENDING</span>
              </div>
            )}

            {gallery.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt ?? `${project.title} gallery ${i + 1}`}
                    loading="lazy"
                    className="aspect-video w-full rounded-xl border border-slate-800 object-cover"
                  />
                ))}
              </div>
            ) : null}

            <div className="prose-invert mt-10 max-w-none">
              {project.description.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="mb-4 text-base leading-relaxed text-slate-300">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="card">
              <h2 className="text-lg font-semibold text-white">Project details</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className="mt-1 font-medium text-white">{statusLabel}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="mt-1 font-medium text-white">{project.category}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Technologies</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.technologies.length > 0 ? (
                      project.technologies.map((t) => <span key={t} className="chip">{t}</span>)
                    ) : (
                      <span className="text-slate-400">Not disclosed</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="mt-1 font-medium text-white">
                    {project.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-white">{project.title} — about this project</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{project.summary}</p>
              {project.externalUrl ? (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 w-full"
                >
                  Open project / demo
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-white">Interested in ADAPT technology?</h2>
              <p className="mt-2 text-sm text-slate-400">
                From AI platforms to automation, we build real systems. Let&apos;s talk about yours.
              </p>
              <div className="mt-4 grid gap-2.5">
                <Link href="/contact" className="btn-primary w-full">Work With Us</Link>
                <Link href="/investors" className="btn-secondary w-full">Invest in ADAPT</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </article>
  );
}