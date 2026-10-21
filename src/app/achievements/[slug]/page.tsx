import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Video, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/constants";
import { VideoPlayer, isLocalVideo } from "@/components/ui/VideoPlayer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const achievement = await prisma.achievement.findUnique({
    where: { slug },
    select: { title: true, description: true, coverImage: true },
  });
  if (!achievement) return {};
  return buildMetadata({
    title: achievement.title,
    description: achievement.description,
    path: `/achievements/${slug}`,
    image: achievement.coverImage ?? undefined,
    type: "article",
  });
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const achievement = await prisma.achievement.findUnique({ where: { slug } });

  if (!achievement || !achievement.published) notFound();
  if (achievement.publishedAt && achievement.publishedAt.getTime() > Date.now()) notFound();

  void prisma.achievement.update({ where: { id: achievement.id }, data: { views: { increment: 1 } } });

  const categoryLabel =
    ACHIEVEMENT_CATEGORIES.find((c) => c.value === achievement.category)?.label ?? achievement.category;
  const gallery: { url: string; alt?: string }[] = Array.isArray(achievement.gallery)
    ? (achievement.gallery as { url: string; alt?: string }[])
    : [];

  return (
    <article>
      <header className="relative overflow-hidden border-b border-slate-800/60">
        {achievement.coverImage ? (
          <div className="absolute inset-0" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={achievement.coverImage} alt="" className="h-full w-full object-cover opacity-20 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
          </div>
        ) : null}
        <div className="container-page relative py-14 sm:py-18">
          <Link href="/achievements" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to achievements
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="chip">{categoryLabel}</span>
            <span className="chip inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {achievement.occurredOn.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {achievement.author ? <span className="chip">By {achievement.author}</span> : null}
          </div>
          <h1 className="h-display mt-4 max-w-3xl">{achievement.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{achievement.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {achievement.externalUrl ? (
              <a href={achievement.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Learn more
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            {achievement.videoUrl && !isLocalVideo(achievement.videoUrl) ? (
              <a href={achievement.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <Video className="h-4 w-4" aria-hidden="true" />
                Watch video
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page max-w-3xl">
          {achievement.videoUrl && isLocalVideo(achievement.videoUrl) ? (
            <VideoPlayer
              src={achievement.videoUrl}
              title={`${achievement.title} — recorded footage`}
              poster={achievement.coverImage}
              className="mb-10"
            />
          ) : null}

          {achievement.coverImage ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={achievement.coverImage}
                alt={`${achievement.title} — featured image`}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : null}

          {gallery.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {gallery.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt ?? `${achievement.title} gallery ${i + 1}`}
                  loading="lazy"
                  className="aspect-video w-full rounded-xl border border-slate-800 object-cover"
                />
              ))}
            </div>
          ) : null}

          <div className="prose-invert mt-10">
            {achievement.content.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-4 text-base leading-relaxed text-slate-300">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 grid gap-3 border-t border-slate-800 pt-8 sm:grid-cols-2">
            <Link href="/achievements" className="btn-secondary">All achievements</Link>
            <Link href="/projects" className="btn-ghost">Explore our projects</Link>
          </div>
        </div>
      </section>
    </article>
  );
}