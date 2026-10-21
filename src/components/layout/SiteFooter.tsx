import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { NAV_ITEMS, SERVICE_GROUPS } from "@/lib/constants";
import type { SiteContent } from "@/lib/settings";

export function SiteFooter({ settings }: { settings: SiteContent }) {
  const c = settings.company;
  const f = settings.founder;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-ink-900/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[110px]" aria-hidden="true" />

      <div className="container-page relative">
        <div className="flex items-center justify-between py-7 font-mono text-[0.75rem] tracking-[0.28em] text-slate-400">
          <span>END OF NODE // SIGNAL REMAINS</span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyanx opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyanx" />
            </span>
            {c.location}
          </span>
        </div>

        <div className="grid gap-10 border-t border-white/[0.08] py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Link href="/" aria-label="ADAPT Technologies — home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-slate-300">{c.brandStatement}</p>
            <p className="mt-3 font-mono text-[0.8125rem] tracking-widest text-cyanx">{c.localTalent}</p>
            <SocialLinks settings={settings} />
          </div>

          <nav aria-label="Footer — company">
            <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.22em] text-slate-400">Company</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group inline-flex items-center gap-1.5 text-[0.9375rem] text-slate-300 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-cyanx transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — capabilities">
            <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.22em] text-slate-400">Capabilities</h2>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_GROUPS.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`} className="group inline-flex items-center gap-1.5 text-[0.9375rem] text-slate-300 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-cyanx transition-all duration-300 group-hover:w-3" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.22em] text-slate-400">Connect</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem] text-slate-300">
              <li>
                <span className="text-slate-400">Founder &amp; CEO:</span>{" "}
                <span className="text-white">{f.name}</span>
              </li>
              <li>
                <a href={`mailto:${c.email}`} className="text-cyanx transition-colors hover:text-white">
                  {c.email}
                </a>
              </li>
              <li>{c.location}</li>
            </ul>
            <Link href="/investors" className="btn-primary mt-5 !px-4 !py-2.5 text-base">
              Invest in ADAPT
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.8125rem] tracking-wider text-slate-400">
            © {year} {c.name}. ALL RIGHTS RESERVED.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.8125rem] tracking-wider text-slate-400">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
            <Link href="/cookies" className="transition-colors hover:text-white">Cookie Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}