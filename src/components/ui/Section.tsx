import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow ? (
        <Reveal>
          <p className={`eyebrow ${centered ? "justify-center" : ""}`}>{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal delay={80}>
        <h2 className="h-section mt-3">{title}</h2>
      </Reveal>
      {lead ? (
        <Reveal delay={160}>
          <p className={`lead mt-4 ${centered ? "mx-auto max-w-2xl" : ""}`}>{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-ink-900/20">
      <div className="absolute inset-0 bg-grid-fine bg-[size:36px_36px] opacity-60" aria-hidden="true" />
      <div
        className="absolute -top-48 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent-600/[0.18] blur-[130px]"
        aria-hidden="true"
      />
      <div className="hud-frame relative container-page py-16 sm:py-20">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="h-display mt-4 max-w-3xl">{title}</h1>
        </Reveal>
        {lead ? (
          <Reveal delay={180}>
            <p className="lead mt-6 max-w-2xl">{lead}</p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={260}>{children}</Reveal> : null}
      </div>
    </section>
  );
}