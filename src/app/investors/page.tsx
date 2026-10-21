import Link from "next/link";
import { Mail, TrendingUp, Hammer, Users, Target, ArrowDown } from "lucide-react";
import { getAllSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { InvestorForm } from "@/components/forms/InvestorForm";
import { LogoMark } from "@/components/brand/Logo";

export const metadata = buildMetadata({
  title: "Invest in ADAPT",
  description:
    "Help build Africa's next generation of technology. ADAPT Technologies is developing intelligent software, hardware and engineering solutions from Lesotho with ambitions to scale across Africa and beyond.",
  path: "/investors",
});

export const dynamic = "force-dynamic";

export default async function InvestorsPage() {
  const settings = await getAllSettings();
  const inv = settings.investor;
  const company = settings.company;

  const featuredCount = await prisma.project.count({ where: { published: true, featured: true } });

  const opportunityRows = [
    { key: "fundingStage", label: "Funding stage" },
    { key: "amountRaised", label: "Amount being raised" },
    { key: "structure", label: "Investment structure" },
    { key: "marketOpportunity", label: "Market opportunity" },
    { key: "milestones", label: "Milestones" },
    { key: "roadmap", label: "Roadmap" },
  ] as const;

  const emptyOpportunity = Object.values(inv.opportunities).every((v) => !v?.trim());

  return (
    <>
      <PageHero
        eyebrow="Invest in ADAPT"
        title={inv.headline}
        lead={inv.subhead}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#investor-form" className="btn-primary">
            Talk to the Founder
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={`mailto:${company.email}`} className="btn-secondary">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {company.email}
          </a>
        </div>
      </PageHero>

      {/* Why ADAPT */}
      <section className="section">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Why ADAPT?"
              title="An opportunity at the intersection of engineering and intelligence"
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {(inv.whyAdapt ?? []).map((item) => (
                <li key={item} className="card flex items-start gap-3 !p-5">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What we are building */}
      <section className="section border-y border-slate-800/60 bg-ink-900/40">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we are building"
            title="A portfolio of emerging technology"
            lead="Current and future product directions — software and hardware."
            align="center"
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
            {(inv.whatWeAreBuilding ?? []).map((item) => (
              <div key={item} className="card flex items-center gap-3 !p-5">
                <Hammer className="h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            {featuredCount > 0
              ? `${featuredCount} featured projects currently showcased on this site — explored in depth on the Projects page.`
              : "See the full public portfolio on the Projects page."}
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/projects" className="btn-secondary">Explore the portfolio</Link>
          </div>
        </div>
      </section>

      {/* Investment opportunities */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Investment opportunities"
            title="Structured, transparent, honest"
            lead="Specific figures are published by the administrator as the company reaches each milestone. Nothing here is invented."
            align="center"
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {opportunityRows.map((row) => {
              const value = inv.opportunities[row.key];
              return (
                <div key={row.key} className="card">
                  <h3 className="text-[0.8125rem] font-semibold uppercase tracking-widest text-slate-400">{row.label}</h3>
                  <p className="mt-3 text-base text-slate-200">
                    {value && value.trim() ? value : "To be finalised and published by the administrator."}
                  </p>
                </div>
              );
            })}
          </div>
          {emptyOpportunity ? (
            <p className="mt-6 text-center text-[0.8125rem] text-slate-400">
              Placeholders shown until official figures are published. No financial claims are made.
            </p>
          ) : null}
        </div>
      </section>

      {/* Use of investment */}
      <section className="section border-t border-slate-800/60 bg-ink-900/40">
        <div className="container-page">
          <SectionHeading
            eyebrow="Use of investment"
            title="Where investment would be applied"
            align="center"
          />
          <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-3">
            {(inv.useOfFunds ?? []).map((item) => (
              <span key={item} className="chip !px-4 !py-2 !text-sm !text-slate-200">
                <TrendingUp className="h-4 w-4 text-accent-400" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Founder CTA */}
      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-accent-500/30 bg-gradient-to-br from-accent-900/40 via-ink-900 to-ink-900 px-8 py-12 text-center sm:px-14">
            <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="mx-auto flex justify-center">
                <LogoMark size={56} />
              </div>
              <h2 className="h-display mx-auto mt-6 max-w-2xl">{inv.ctaTitle}</h2>
              <p className="lead mx-auto mt-4 max-w-xl">{inv.ctaBody}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="#investor-form" className="btn-primary">
                  Talk to the Founder
                </a>
                <a href={`mailto:${settings.founder.email}`} className="btn-secondary">
                  {settings.founder.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investor form */}
      <section id="investor-form" className="section scroll-mt-24 border-t border-slate-800/60 bg-ink-900/40">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Investor contact"
              title="Start an investment conversation"
              lead="The founder's team reviews every inquiry personally. No pitches, no pressure — just a direct line to the people building."
            />
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <p className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                We welcome angel investors, venture funds, corporate and technology partners,
                institutions and innovation-focused mentors.
              </p>
              <p className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                Prefer email?
                <a href={`mailto:${settings.founder.email}`} className="font-medium text-accent-400 hover:text-accent-300">
                  {settings.founder.email}
                </a>
              </p>
            </div>
          </div>
          <InvestorForm />
        </div>
      </section>
    </>
  );
}