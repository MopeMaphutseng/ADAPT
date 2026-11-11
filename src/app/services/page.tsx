import Link from "next/link";
import {
  Cpu,
  Microchip,
  Bot,
  ShieldCheck,
  Factory,
  Leaf,
  GraduationCap,
  Compass,
  Globe2,
  CloudSun,
  Droplets,
  Satellite,
  Radar,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { SERVICE_GROUPS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/ui/Section";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "AI & software engineering, embedded systems & IoT, robotics, cybersecurity, industrial automation, climate modeling, Earth observation, agricultural technology, education technology and consulting from ADAPT Technologies.",
  path: "/services",
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  chip: Microchip,
  robot: Bot,
  shield: ShieldCheck,
  factory: Factory,
  leaf: Leaf,
  globe: Globe2,
  school: GraduationCap,
  compass: Compass,
};

const CLIMATE_SIGNALS = [
  "Climate modeling",
  "Earth observation",
  "Geospatial intelligence",
  "Digital twins",
  "Hazard simulation",
  "Water resilience",
];

const CLIMATE_PILLARS = [
  { icon: CloudSun, title: "Atmosphere", text: "Climate & weather systems" },
  { icon: Droplets, title: "Water", text: "Hydrology & drought risk" },
  { icon: Leaf, title: "Land", text: "Agriculture & ecosystems" },
  { icon: Radar, title: "Risk", text: "Hazards & resilience" },
];

const APPROACH = [
  { title: "1 · Understand", text: "We start with the real problem — context, constraints and the people involved." },
  { title: "2 · Design", text: "Software and hardware architecture designed as one system, not isolated pieces." },
  { title: "3 · Build", text: "Engineered, tested and refined — prototypes first, production quality after." },
  { title: "4 · Deploy & support", text: "Deployment, monitoring, security and continuous improvement." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Full-stack technology & engineering"
        lead="From intelligent software and connected hardware to climate modeling and Earth observation, ADAPT builds complete technology systems that solve real problems."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Request a service</Link>
          <Link href="/projects" className="btn-secondary">View our projects</Link>
        </div>
      </PageHero>

      {/* Services grid */}
      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SERVICE_GROUPS.map((s) => {
              const Icon = ICONS[s.icon] ?? Cpu;
              return (
                <article key={s.slug} id={s.slug} className="card scroll-mt-24">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-500/30 bg-accent-500/10 text-accent-400">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
                  <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Climate & Earth intelligence */}
      <section
        id="climate-intelligence"
        className="section relative overflow-hidden border-y border-white/[0.08] bg-ink-900/30"
      >
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyanx/10 blur-[130px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violetx-500/10 blur-[120px]" aria-hidden="true" />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyanx/25 bg-cyanx/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cyanx">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Frontier capability
              </span>
              <h2 className="h-section mt-5">
                Model the planet.
                <br />
                <span className="text-gradient">Design for resilience.</span>
              </h2>
              <p className="lead mt-5 max-w-xl">
                ADAPT combines climate science, Earth observation and geospatial AI to help
                organisations anticipate risk, plan adaptation and make better decisions for
                land, water, energy and food systems.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {CLIMATE_SIGNALS.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300"
                  >
                    {signal}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  Discuss a climate project
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="#climate-environment" className="btn-secondary">
                  Explore the capability
                </Link>
              </div>
            </div>

            <div className="card hud-frame card-grid relative overflow-hidden !p-6 sm:!p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">
                  Planetary intelligence stack
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cyanx">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyanx opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyanx" />
                  </span>
                  Simulation view
                </span>
              </div>

              <div className="relative mx-auto my-8 flex aspect-square w-full max-w-[19rem] items-center justify-center">
                <div className="absolute inset-2 rounded-full border border-white/[0.06]" />
                <div className="absolute inset-8 rounded-full border border-cyanx/20" />
                <div className="absolute inset-14 animate-spin-slower rounded-full border border-dashed border-cyanx/30" />
                <div className="absolute inset-20 rounded-full border border-accent-400/30" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-cyanx/30 bg-gradient-to-br from-cyanx/20 to-accent-600/10 shadow-glow">
                  <Globe2 className="h-16 w-16 text-cyanx" aria-hidden="true" />
                </div>
                <span className="absolute left-[18%] top-[22%] flex h-9 w-9 animate-float items-center justify-center rounded-full border border-white/10 bg-ink-900/90 text-cyanx shadow-card">
                  <Satellite className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="absolute bottom-[24%] right-[15%] flex h-8 w-8 animate-float-slow items-center justify-center rounded-full border border-white/10 bg-ink-900/90 text-accent-300 shadow-card">
                  <Radar className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="absolute right-[20%] top-[16%] font-mono text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
                  orbit / 01
                </span>
                <span className="absolute bottom-[14%] left-[16%] font-mono text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
                  geo / model
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CLIMATE_PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-xl border border-white/[0.08] bg-ink-950/50 p-3"
                    >
                      <Icon className="h-4 w-4 text-cyanx" aria-hidden="true" />
                      <p className="mt-2 text-sm font-semibold text-white">{pillar.title}</p>
                      <p className="mt-0.5 text-[0.75rem] leading-relaxed text-slate-400">
                        {pillar.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section border-t border-slate-800/60 bg-ink-900/40">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we work"
            title="A disciplined engineering approach"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((step) => (
              <div key={step.title} className="card">
                <h3 className="font-mono text-sm font-semibold text-accent-400">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="card text-center !py-14">
            <h2 className="h-section">Have a problem worth solving?</h2>
            <p className="lead mx-auto mt-3 max-w-xl">
              Tell us what you are building. We will work out whether ADAPT is the right
              engineering partner for it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary">
                Work With ADAPT
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/investors" className="btn-ghost">Partner With Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}