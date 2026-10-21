import { getAllSettings } from "@/lib/settings";
import { PageHero } from "@/components/ui/Section";

export default async function LegalPage({
  slug,
  title,
  eyebrow,
}: {
  slug: "privacy" | "terms" | "cookies";
  title: string;
  eyebrow: string;
}) {
  const settings = await getAllSettings();
  const text =
    slug === "privacy"
      ? settings.legal.privacy
      : slug === "terms"
        ? settings.legal.terms
        : settings.legal.cookies;

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} />
      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="card">
            <p className="text-base leading-relaxed text-slate-300">{text}</p>
            <p className="mt-6 border-t border-slate-800 pt-4 text-[0.8125rem] text-slate-400">
              This document is maintained by the ADAPT Technologies administrator. Last updated
              content is managed from the admin dashboard.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}