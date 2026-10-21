import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Sparkles,
  CircuitBoard,
  Bot,
  Globe,
  Building2,
  ShieldCheck,
  Lightbulb,
  ChevronRight,
  Play,
} from "lucide-react";
import { getAllSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { SERVICE_GROUPS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/Section";
import { ProjectCard, AchievementCard } from "@/components/ui/Cards";
import { LogoMark } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { CanvasConstellation } from "@/components/ui/CanvasConstellation";
import { ScienceDivider } from "@/components/ui/ScienceDivider";
import { HeroVisual } from "@/components/ui/HeroVisual";
import { VideoPlayer, VideoBackdrop } from "@/components/ui/VideoPlayer";

export const metadata = buildMetadata({
  title: "ADAPT Technologies — Intelligent Solutions. Real Impact.",
  description:
    "ADAPT Technologies is an African technology and engineering company based in Lesotho building intelligent software, hardware and systems. Local Talent. Global Vision.",
  path: "/",
});

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: "Artificial Intelligence",
    text: "AI applications, agents and intelligent software built for real problems.",
  },
  {
    icon: CircuitBoard,
    title: "Software Engineering",
    text: "Web, mobile, backend and cloud systems engineered to production quality.",
  },
  {
    icon: Cpu,
    title: "Electronics & Embedded",
    text: "Sensors, microcontrollers and connected devices that bridge data and the physical world.",
  },
  {
    icon: Bot,
    title: "Robotics & Automation",
    text: "Autonomous systems and intelligent control for industrial and field operations.",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    text: "Security-first engineering for networks, devices, software and people.",
  },
  {
    icon: Building2,
    title: "Industrial & Agritech",
    text: "Automation, monitoring and smart systems for industry and agriculture.",
  },
];

// Render on every request so newly published projects and achievements appear
// on the home page immediately without a rebuild.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getAllSettings();
  const c = settings.company;
  const home = settings.home;

  const [featuredProjects, featuredAchievements, projectCount, achievementCount, videoProjects, videoAchievements] =
    await Promise.all([
      prisma.project.findMany({
        where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
        take: 3,
      }),
      prisma.achievement.findMany({
        where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
        orderBy: [{ occurredOn: "desc" }],
        take: 4,
      }),
      prisma.project.count({ where: { published: true } }),
      prisma.achievement.count({ where: { published: true } }),
      prisma.project.findMany({
        where: { published: true, videoUrl: { not: null } },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
        take: 4,
        select: { slug: true, title: true, coverImage: true, videoUrl: true },
      }),
      prisma.achievement.findMany({
        where: { published: true, videoUrl: { not: null } },
        orderBy: [{ featured: "desc" }, { occurredOn: "desc" }],
        take: 3,
        select: { slug: true, title: true, coverImage: true, videoUrl: true },
      }),
    ]);

  // Prefer the "Projects over the years" retrospective as the hero clip when
  // it is available; fall back to whatever the admin published first.
  const orderedAchievementVideos = [
    ...videoAchievements.filter((a) => a.slug === "projects-overview"),
    ...videoAchievements.filter((a) => a.slug !== "projects-overview"),
  ];

  const showcase: {
    href: string;
    title: string;
    poster: string | null;
    videoUrl: string;
    label: string;
  }[] = [
    ...orderedAchievementVideos.map((a) => ({
      href: `/achievements/${a.slug}`,
      title: a.title,
      poster: a.coverImage,
      videoUrl: a.videoUrl as string,
      label: "Achievement",
    })),
    ...videoProjects.map((p) => ({
      href: `/projects/${p.slug}`,
      title: p.title,
      poster: p.coverImage,
      videoUrl: p.videoUrl as string,
      label: "Project",
    })),
  ];
  const mainVideo = showcase[0];
  const sideVideos = showcase.slice(1, 4);

  const phaseCount = (settings.roadmap.phases ?? []).length;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <CanvasConstellation className="absolute inset-0" interactive density={0.00009} />
        <div className="absolute inset-0 bg-grid-fine bg-[size:44px_44px] opacity-50" aria-hidden="true" />
        <div
          className="absolute -top-48 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-accent-600/20 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 -right-40 h-[420px] w-[420px] rounded-full bg-violetx-500/[0.12] blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-page relative grid gap-14 py-24 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-32">
          <div>
            <span className="eyebrow inline-flex animate-rise-in">{home.heroEyebrow}</span>
            <h1 className="mt-5">
              {home.heroTitle
                .split(".")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((part, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${120 + i * 110}ms` }}
                    className={`block animate-rise-in ${i === 0 ? "text-gradient-animated" : ""}`}
                  >
                    {i === 0 ? part : part + "."}
                  </span>
                ))}
            </h1>
            <div className="mt-7 max-w-xl animate-rise-in" style={{ animationDelay: "420ms" }}>
              <p className="text-lg leading-relaxed text-slate-300">{home.heroSubtitle}</p>
            </div>
            <p
              className="mt-3 animate-rise-in font-mono text-[0.8125rem] tracking-[0.2em] text-slate-400"
              style={{ animationDelay: "500ms" }}
            >
              {home.heroSupport}
            </p>
            <div
              className="mt-9 flex animate-rise-in flex-wrap items-center gap-3"
              style={{ animationDelay: "580ms" }}
            >
              <Link href="/projects" className="btn-primary">
                Explore Our Technology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Work With Us
              </Link>
              <Link href="/investors" className="btn-ghost">
                Invest in ADAPT
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p
              className="mt-9 animate-rise-in text-[0.9375rem] text-slate-300"
              style={{ animationDelay: "660ms" }}
            >
              <span className="text-cyanx">{c.localTalent}</span>{" "}
              <span className="text-slate-600">·</span> {c.position}
            </p>
          </div>

          <HeroVisual />
        </div>

        {/* Live data band */}
        <div className="relative border-t border-white/[0.08] bg-ink-950/50 backdrop-blur">
          <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
            {[
              { label: "CAPABILITIES", value: SERVICE_GROUPS.length },
              { label: "PUBLISHED PROJECTS", value: projectCount },
              { label: "LOG ENTRIES", value: achievementCount },
              { label: "ROADMAP PHASES", value: phaseCount },
            ].map((s, i) => (
              <div
                key={s.label}
                className="animate-rise-in"
                style={{ animationDelay: `${700 + i * 90}ms` }}
              >
                <p className="font-mono text-[0.75rem] tracking-[0.28em] text-slate-400">{s.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold text-gradient">
                  <Counter value={s.value} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPANY INTRODUCTION ============ */}
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="An African technology & engineering company"
              lead="Technology should not only be consumed. Africa should build technology — engineer products, develop intellectual property, create intelligent infrastructure and export innovation."
            />
            <Reveal delay={120}>
              <Link href="/about" className="btn-secondary mt-8">
                Learn more about ADAPT
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Lightbulb, label: "Philosophy", text: c.philosophy },
              { icon: Globe, label: "Long-term vision", text: c.longVision },
              { icon: Bolt, label: "Brand message", text: `${c.brandStatement}` },
              { icon: Compass, label: "Positioning", text: c.position },
            ].map(({ icon: Icon, label, text }, i) => (
              <Reveal key={label} delay={i * 100} direction={i % 2 ? "right" : "up"}>
                <div className="card hud-frame card-grid h-full">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-500/30 bg-accent-500/10">
                    <Icon className="h-5 w-5 text-cyanx" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-sm font-semibold text-white">{label}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-400">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CORE CAPABILITIES ============ */}
      <section className="section overflow-hidden border-y border-white/[0.08] bg-ink-900/30">
        <div className="pointer-events-none absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-accent-600/10 blur-[110px]" aria-hidden="true" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Capabilities"
            title="Engineering intelligence across disciplines"
            lead="ADAPT combines software, hardware and artificial intelligence to build complete technology systems — not isolated features."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={(i % 3) * 90}>
                <div className="card hud-frame card-grid group h-full">
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent-500/25 bg-gradient-to-br from-accent-500/15 to-transparent">
                    <Icon className="h-5 w-5 text-accent-300 transition-colors duration-300 group-hover:text-cyanx" aria-hidden="true" />
                    <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_0_18px_rgba(56,225,255,0.4)]" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-400">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROJECTS ============ */}
      {featuredProjects.length > 0 ? (
        <section className="section">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Featured projects"
                title="Technology in the making"
                lead="From AI platforms to autonomous systems, ADAPT is building a portfolio of real products."
              />
              <Reveal delay={120}>
                <Link href="/projects" className="btn-ghost shrink-0">
                  All projects
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProjects.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ WORK IN MOTION (VIDEO SHOWCASE) ============ */}
      {mainVideo ? (
        <section className="section overflow-hidden border-y border-white/[0.08] bg-ink-900/30">
          <div
            className="pointer-events-none absolute -right-40 top-1/4 h-80 w-80 rounded-full bg-violetx-500/10 blur-[110px]"
            aria-hidden="true"
          />
          <div className="container-page relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Work in motion"
                title="See our technology in action"
                lead="Footage from real builds — electronics, prototypes and software the team has engineered over the years."
              />
              <Reveal delay={120}>
                <Link href="/projects" className="btn-ghost shrink-0">
                  Explore the portfolio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
              <Reveal direction="zoom">
                <VideoPlayer
                  src={mainVideo.videoUrl}
                  title={mainVideo.title}
                  poster={mainVideo.poster}
                  label={mainVideo.label}
                />
              </Reveal>

              {sideVideos.length > 0 ? (
                <div className="grid content-start gap-4">
                  {sideVideos.map((v, i) => (
                    <Reveal key={v.href} delay={i * 90} direction="right">
                      <Link
                        href={v.href}
                        className="card hud-frame group flex items-center gap-4 !p-3 transition-colors hover:border-accent-500/40"
                      >
                        <span className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-950">
                          <VideoBackdrop
                            src={v.videoUrl}
                            poster={v.poster}
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <span className="absolute inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyanx-400/50 bg-ink-950/70 text-cyanx backdrop-blur">
                            <Play className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyanx">
                            {v.label}
                          </span>
                          <span className="mt-1 block font-semibold text-white transition-colors group-hover:text-cyanx">
                            {v.title}
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ TECHNOLOGY AREAS ============ */}
      <section className="section overflow-hidden border-y border-white/[0.08] bg-ink-900/30">
        <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-violetx-500/10 blur-[110px]" aria-hidden="true" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="What we do"
            title="Full-stack technology & engineering services"
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_GROUPS.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 80}>
                <Link
                  href={`/services#${s.slug}`}
                  className="card hud-frame card-grid group block h-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white transition-colors group-hover:text-cyanx">
                      {s.title}
                    </h3>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyanx"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-400">{s.description}</p>
                  <p className="mt-4 font-mono text-[0.75rem] tracking-[0.18em] text-slate-500">
                    {String(s.items.length).padStart(2, "0")} CAPABILITIES
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ACHIEVEMENTS ============ */}
      {featuredAchievements.length > 0 ? (
        <section className="section">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Achievements"
                title="Progress, documented"
                lead="ADAPT publishes real progress — development milestones, prototypes, launches and partnerships as they happen."
              />
              <Reveal delay={120}>
                <Link href="/achievements" className="btn-ghost shrink-0">
                  All achievements
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredAchievements.map((a, i) => (
                <Reveal key={a.id} delay={i * 80}>
                  <AchievementCard achievement={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ FOUNDER ============ */}
      <section className="section overflow-hidden border-t border-white/[0.08] bg-ink-900/30">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[110px]" aria-hidden="true" />
        <div className="container-page relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal direction="left" delay={80}>
            <div
              className="hud-frame relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900"
            >
              {settings.founder.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.founder.image}
                  alt={`${settings.founder.name} — ${settings.founder.title} of ${settings.founder.company}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <div className="relative">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full border border-cyanx-500/40" />
                    <LogoMark size={88} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{settings.founder.name}</p>
                    <p className="mt-1 font-mono text-[0.8125rem] tracking-widest text-cyanx">
                      {settings.founder.title.toUpperCase()}
                    </p>
                  </div>
                  <p className="font-mono text-[0.7rem] tracking-[0.26em] text-slate-400">PHOTOGRAPH PENDING</p>
                </div>
              )}
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Founder & CEO"
              title="Mope Samuel Maphutseng"
              lead="Founder & CEO, ADAPT Technologies"
            />
            <Reveal delay={120}>
              <p className="mt-4 text-base leading-relaxed text-slate-200">
                An emerging engineer, software developer, AI builder, electronics enthusiast and
                technology entrepreneur building intelligent technology from Lesotho with ambitions
                to scale across Africa and the world.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-6 flex flex-wrap gap-2">
                {(settings.founder.highlights ?? []).slice(0, 5).map((h) => (
                  <span key={h} className="chip font-mono !tracking-wider">{h}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="btn-secondary">
                  Read the founder story
                </Link>
                <Link href="/investors" className="btn-ghost">
                  Talk to the Founder
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ INVESTMENT OPPORTUNITY ============ */}
      <section className="section">
        <div className="container-page">
          <Reveal direction="zoom">
            <div className="hud-frame card-grid relative overflow-hidden rounded-3xl border border-accent-500/25 bg-gradient-to-br from-ink-900 via-ink-900/70 to-ink-900/40 !p-8 sm:!p-14">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-cyanx-500/10 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="eyebrow mb-3">Invest in ADAPT</p>
                  <h2 className="h-display">{settings.investor.headline}</h2>
                  <p className="lead mt-5">{settings.investor.subhead}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/investors" className="btn-primary">
                      Invest in ADAPT
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link href={`mailto:${c.email}`} className="btn-secondary">
                      Email the Founder
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative mx-auto aspect-square w-full max-w-[260px]">
                    <div className="absolute inset-0 animate-spin-slower rounded-full border border-accent-500/25 border-dashed" />
                    <div className="absolute inset-6 animate-spin-reverse rounded-full border border-white/10" style={{ borderTopColor: "rgba(56,225,255,0.6)" }} />
                    <div className="absolute inset-[46%] rounded-full bg-gradient-to-br from-accent-400 to-cyanx shadow-[0_0_40px_rgba(56,225,255,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ VISION / ROADMAP ============ */}
      <section className="section border-t border-white/[0.08] bg-ink-900/30">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Our vision" title={home.visionTitle} lead={home.visionText} />
            <Reveal delay={120}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-200">
                {c.philosophy} — The long-term journey:{" "}
                <span className="font-semibold text-gradient">Lesotho → Africa → Global</span>.
              </p>
            </Reveal>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full bg-accent-600/[0.08] blur-[80px]" aria-hidden="true" />
            <ul className="space-y-4">
              {(settings.roadmap.phases ?? []).map((phase, idx) => (
                <Reveal key={phase.key} delay={idx * 100} direction="right">
                  <li className="card hud-frame flex items-start gap-4 !p-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent-500/30 bg-accent-500/10 font-mono text-[0.8125rem] font-semibold text-cyanx">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[0.9375rem] font-semibold text-white">
                        {phase.label} <span className="text-slate-500">—</span> {phase.title}
                      </p>
                      <p className="mt-1 text-[0.9375rem] text-slate-300">{phase.items.join(" · ")}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-page">
        <ScienceDivider />
      </div>

      {/* ============ FINAL CTA ============ */}
      <section className="section pt-10">
        <div className="container-page">
          <Reveal direction="zoom">
            <div className="hud-frame card card-grid text-center !py-16">
              <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-[480px] -translate-x-1/2 rounded-full bg-accent-600/[0.12] blur-[90px]" aria-hidden="true" />
              <div className="relative">
                <p className="eyebrow mb-3 justify-center">Work with ADAPT</p>
                <h2 className="h-display mx-auto max-w-2xl">
                  We don&apos;t just adapt to the future. We build it.
                </h2>
                <p className="lead mx-auto mt-4 max-w-xl">
                  Have a problem worth solving? Partner with an African engineering company building
                  real technology.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/contact" className="btn-primary">
                    Contact ADAPT
                  </Link>
                  <Link href="/services" className="btn-secondary">
                    Explore services
                  </Link>
                  <Link href="/investors" className="btn-ghost">
                    Partner With Us
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// Local icon imports to keep the tree tidy
function Bolt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}