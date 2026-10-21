"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { NAV_ITEMS } from "@/lib/constants";
import type { SiteContent } from "@/lib/settings";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export function SiteHeader({ settings }: { settings: SiteContent }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onNavigate = () => setOpen(false);
    window.addEventListener("popstate", onNavigate);
    return () => window.removeEventListener("popstate", onNavigate);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-ink-950/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="ADAPT Technologies — home" className="relative z-[60]">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-accent-400 via-cyanx to-violetx-400 transition-transform duration-300 group-hover:scale-x-100 ${
                    active ? "scale-x-100" : ""
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <GlobalSearch />
          <Link href="/contact" className="btn-secondary !px-4 !py-2.5 text-sm">
            Work With Us
          </Link>
          <Link href="/investors" className="btn-primary !px-4 !py-2.5 text-sm">
            Invest in ADAPT
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <GlobalSearch />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] text-white"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 top-16 z-40 lg:hidden overflow-y-auto border-t border-white/[0.08] bg-ink-950/95 backdrop-blur-xl"
        >
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-6">
            {NAV_ITEMS.map((item, i) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`flex items-center justify-between rounded-xl px-3 py-4 text-lg font-semibold transition-colors ${
                    active ? "text-cyanx bg-white/[0.04]" : "text-white hover:bg-white/5"
                  } animate-rise-in`}
                >
                  {item.label}
                  <span className="font-mono text-[0.7rem] tracking-widest text-slate-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
            <div className="mt-4 grid gap-3 border-t border-white/[0.08] pt-6">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Work With Us
              </Link>
              <Link
                href="/investors"
                onClick={() => setOpen(false)}
                className="btn-secondary w-full"
              >
                Invest in ADAPT
              </Link>
            </div>
            <p className="mt-8 font-mono text-[0.8125rem] tracking-widest text-slate-400">
              {settings.company.name} · {settings.company.location}
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
