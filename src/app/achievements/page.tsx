import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/Section";
import { AchievementCard } from "@/components/ui/Cards";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/constants";

const PER_PAGE = 12;

export const metadata = buildMetadata({
  title: "Achievements",
  description:
    "Monthly, quarterly and yearly milestones from ADAPT Technologies — prototypes, launches, partnerships and company news, published by the team.",
  path: "/achievements",
});

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const category = sp.category?.toUpperCase();

  const now = new Date();
  const where = {
    published: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    ...(category ? { category: category as never } : {}),
  };

  const [total, achievements] = await Promise.all([
    prisma.achievement.count({ where }),
    prisma.achievement.findMany({
      where,
      orderBy: [{ occurredOn: "desc" }, { featured: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const years = Array.from(new Set(achievements.map((a) => new Date(a.occurredOn).getFullYear()))).sort((a, b) => b - a);

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Progress, documented"
        lead="ADAPT publishes real progress as it happens — development milestones, prototypes, product launches and partnerships."
      />

      <section className="section pt-12">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Link href="/achievements" className={!category ? "chip !border-accent-500 !text-accent-300" : "chip hover:border-slate-500"}>
              All
            </Link>
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={category === c.value ? "/achievements" : `/achievements?category=${c.value.toLowerCase()}`}
                className={category === c.value ? "chip !border-accent-500 !text-accent-300" : "chip hover:border-slate-500"}
              >
                {c.label}
              </Link>
            ))}
          </div>

          {achievements.length > 0 ? (
            <>
              {years.map((year) => (
                <div key={year} className="mb-10">
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="font-mono text-xl font-bold text-white">{year}</h2>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {achievements
                      .filter((a) => new Date(a.occurredOn).getFullYear() === year)
                      .map((a) => (
                        <AchievementCard key={a.id} achievement={a} />
                      ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="card text-center !py-16">
              <p className="text-slate-400">No achievements published in this timeline yet.</p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/achievements?page=${p}${category ? `&category=${category.toLowerCase()}` : ""}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-accent-500 text-white"
                      : "border border-slate-700 text-slate-300 hover:border-accent-500"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}