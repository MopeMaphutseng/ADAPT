import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Hammer, Cpu, Waypoints } from "lucide-react";
import { getAllSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { LogoMark } from "@/components/brand/Logo";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about ADAPT Technologies — the African technology and engineering company from Lesotho building intelligent software, hardware and systems.",
  path: "/about",
});

const BELIEFS = [
  "Build technology",
  "Engineer products",
  "Develop intellectual property",
  "Create intelligent infrastructure",
  "Develop local talent",
  "Create technology businesses",
  "Export technology",
];

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getAllSettings();
  const c = settings.company;
  const f = settings.founder;

  const projectCount = await prisma.project.count({ where: { published: true } });
  const achievementCount = await prisma.achievement.count({ where: { published: true } });

  const stats = [
    { value: projectCount, label: "Projects in development" },
    { value: achievementCount, label: "Published achievements" },
    { value: "3", label: "Engineering disciplines" },
    { value: "1", label: "Mission — build African technology" },
  ];

  return (
    <>
      <PageHero
        eyebrow="About ADAPT Technologies"
        title="We don't just adapt to the future. We build it."
        lead={c.heroSupport}
      />

      {/* Who we are */}
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading eyebrow="Who we are" title="A technology & engineering company from Lesotho" />
            <div className="mt-6 space-y-5 text-slate-300">
              <p className="leading-relaxed">
                ADAPT Technologies is an African technology and engineering company based in{" "}
                {c.location} with a vision of developing solutions that can serve Africa — and
                eventually the global market.
              </p>
              <p className="leading-relaxed">
                We combine artificial intelligence, software engineering, electronics, embedded
                systems, IoT, robotics, automation, cybersecurity, industrial automation,
                agricultural technology, energy technology and education technology. Our
                multidisciplinary approach means we build complete systems: from intelligent
                software to physical, connected and autonomous hardware.
              </p>
              <p className="leading-relaxed">
                The company begins in Lesotho, but it is not limited to Lesotho. Our long-term
                direction is clear: <span className="font-semibold text-white">Lesotho → Africa → Global</span>.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects" className="btn-primary">
                See our projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Work With Us
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400">WHAT WE BELIEVE</h3>
            <p className="mt-3 text-lg font-semibold text-white">
              Technology should not only be consumed. Africa should also…
            </p>
            <ul className="mt-5 space-y-3">
              {BELIEFS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="font-mono text-[0.8125rem] uppercase tracking-[0.22em] text-accent-400">{c.philosophy}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-800/60 bg-ink-900/40">
        <div className="container-page grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multidisciplinary */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Multidisciplinary engineering"
            title="One company. Many engineering strengths."
            lead="ADAPT builds the software and the hardware. Intelligence is not an add-on — it is the foundation."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Cpu,
                title: "Software Intelligence",
                text: "AI systems, agents, platforms and applications that learn, reason and act.",
              },
              {
                icon: Hammer,
                title: "Hardware & Embedded",
                text: "Electronics, microcontrollers, sensors and connected devices engineered in-house.",
              },
              {
                icon: Waypoints,
                title: "Systems Integration",
                text: "Software, hardware and networks combined into dependable, intelligent systems.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="card">
                <Icon className="h-6 w-6 text-accent-400" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="section border-t border-slate-800/60 bg-ink-900/40">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-ink-800">
            {f.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image} alt={`${f.name} — ${f.title} of ${f.company}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <LogoMark size={64} />
                <div>
                  <p className="px-6 font-semibold text-white">{f.name}</p>
                  <p className="mt-1 font-mono text-[0.8125rem] tracking-widest text-accent-400">{f.title.toUpperCase()}</p>
                </div>
                <p className="font-mono text-[0.7rem] tracking-[0.26em] text-slate-400">PHOTOGRAPH PENDING</p>
              </div>
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Founder & CEO" title={f.name} />
            <p className="mt-2 font-medium text-slate-300">
              {f.title}, {f.company}
            </p>
            <div className="mt-6 space-y-5 text-slate-300">
              {f.bio.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {(f.highlights ?? []).map((h) => (
                <span key={h} className="chip">{h}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/investors" className="btn-primary">
                Talk to the Founder
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href={`mailto:${f.email}`} className="btn-secondary">
                {f.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company story */}
      <section className="section">
        <div className="container-page max-w-4xl text-center">
          <SectionHeading
            eyebrow="Company story"
            title="Africa should build technology"
            lead={c.vision}
            align="center"
          />
          <p className="lead mx-auto mt-6 max-w-2xl">
            {c.brandStatement} — developing intelligent technology, engineering systems and digital
            products capable of solving real problems. Built in Lesotho. For Africa. For the world.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/contact" className="btn-primary">
              Contact ADAPT
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}