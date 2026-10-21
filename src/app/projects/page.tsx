import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/Section";
import { ProjectCard } from "@/components/ui/Cards";

const PER_PAGE = 9;

export const metadata = buildMetadata({
  title: "Projects & Products",
  description:
    "Explore the products and projects being built at ADAPT Technologies — AI platforms, embedded systems, robotics, cybersecurity, agricultural technology and more.",
  path: "/projects",
});

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status?.toUpperCase();

  const where = {
    published: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    ...(status ? { status: status as never } : {}),
  };

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const visibleStatuses = ["IDEA", "RESEARCH", "PROTOTYPE", "DEVELOPMENT", "TESTING", "BETA", "PRODUCTION", "COMPLETED"];

  return (
    <>
      <PageHero
        eyebrow="Projects & Products"
        title="Technology in the making"
        lead="A dynamic portfolio of intelligent software, hardware and engineering systems under development at ADAPT Technologies."
      />

      <section className="section pt-12">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Link href="/projects" className={!status ? "chip !border-accent-500 !text-accent-300" : "chip hover:border-slate-500"}>
              All
            </Link>
            {visibleStatuses.map((s) => (
              <Link
                key={s}
                href={status === s ? "/projects" : `/projects?status=${s.toLowerCase()}`}
                className={status === s ? "chip !border-accent-500 !text-accent-300" : "chip hover:border-slate-500"}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="card text-center !py-16">
              <p className="text-slate-400">No projects in this view yet. Check back soon.</p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/projects?page=${p}${status ? `&status=${status.toLowerCase()}` : ""}`}
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