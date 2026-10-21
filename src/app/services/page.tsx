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
  ArrowRight,
  Check,
} from "lucide-react";
import { SERVICE_GROUPS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/ui/Section";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "AI & software engineering, embedded systems & IoT, robotics, cybersecurity, industrial automation, agricultural technology, education technology and consulting from ADAPT Technologies.",
  path: "/services",
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  chip: Microchip,
  robot: Bot,
  shield: ShieldCheck,
  factory: Factory,
  leaf: Leaf,
  school: GraduationCap,
  compass: Compass,
};

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
        lead="From intelligent software to connected hardware, ADAPT builds complete technology systems that solve real problems."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Request a service</Link>
          <Link href="/projects" className="btn-secondary">View our projects</Link>
        </div>
      </PageHero>

      {/* Services grid */}
      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
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