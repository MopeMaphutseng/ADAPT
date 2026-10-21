import { prisma } from "@/lib/db";
import { SERVICE_GROUPS, SEED_PROJECTS, ACHIEVEMENT_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slugify";

export interface SearchDocument {
  id: string;
  type: "page" | "project" | "achievement" | "service" | "announcement";
  title: string;
  url: string;
  urlPath: string;
  text: string;
  keywords: string[];
  snippet: string;
}

let cache: { ts: number; docs: SearchDocument[] } | null = null;
const CACHE_TTL = 30_000;

function clean(s?: string) {
  return (s ?? "").replace(/\r\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

export async function buildIndex(): Promise<SearchDocument[]> {
  const now = Date.now();
  if (cache && now - cache.ts < CACHE_TTL) {
    return cache.docs;
  }

  const docs: SearchDocument[] = [];
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const b = base.replace(/\/$/, "");

  // Static pages
  const pages: Array<{ title: string; url: string; text: string; keys?: string[] }> = [
    { title: "Home", url: `${b}/`, text: "Home ADAPT Technologies intelligent software hardware engineering Africa Lesotho", keys: ["home"] },
    { title: "About", url: `${b}/about`, text: "About founder Mope Samuel Maphutseng vision Africa build technology", keys: ["about", "founder", "team"] },
    { title: "Services", url: `${b}/services`, text: "AI software embedded IoT robotics cybersecurity automation agriculture education technology consulting", keys: ["services"] },
    { title: "Projects", url: `${b}/projects`, text: "Projects portfolio", keys: ["projects", "portfolio"] },
    { title: "Achievements", url: `${b}/achievements`, text: "Achievements milestones news", keys: ["achievements"] },
    { title: "Investors", url: `${b}/investors`, text: "Invest in ADAPT Technologies", keys: ["investors", "funding"] },
    { title: "Contact", url: `${b}/contact`, text: "Contact form work with us", keys: ["contact"] },
    { title: "Privacy Policy", url: `${b}/privacy`, text: "Privacy policy", keys: ["privacy"] },
    { title: "Terms of Service", url: `${b}/terms`, text: "Terms service", keys: ["terms"] },
    { title: "Cookie Policy", url: `${b}/cookies`, text: "Cookies policy", keys: ["cookies"] },
  ];
  for (const p of pages) {
    docs.push({
      id: `page:${p.url}`,
      type: "page",
      title: p.title,
      url: p.url,
      urlPath: new URL(p.url).pathname,
      text: clean(p.text),
      keywords: (p.keys ?? []).map(clean),
      snippet: p.title,
    });
  }

  // Services
  for (const s of SERVICE_GROUPS) {
    const url = `${b}/services#${s.slug}`;
    const txt = `${s.title} ${s.description} ${s.items.join(" ")}`.toLowerCase();
    docs.push({
      id: `service:${s.slug}`,
      type: "service",
      title: s.title,
      url,
      urlPath: "/services",
      text: clean(txt),
      keywords: ["service", s.slug].map(clean),
      snippet: s.description,
    });
  }

  // Published projects from DB
  try {
    const projs = await prisma.project.findMany({
      where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      select: { id: true, slug: true, title: true, summary: true, description: true, category: true, technologies: true, status: true },
    });
    for (const p of projs) {
      const url = `${b}/projects/${p.slug}`;
      const txt = `${p.title} ${p.summary} ${p.description} ${p.category ?? ""} ${(p.technologies ?? []).join(" ")} ${p.status}`.toLowerCase();
      docs.push({
        id: `project:${p.id}`,
        type: "project",
        title: p.title,
        url,
        urlPath: `/projects/${p.slug}`,
        text: clean(txt),
        keywords: ["project", p.slug].map(clean),
        snippet: p.summary,
      });
    }
  } catch (e) {
    // Fallback to constants if DB not ready
    for (const p of SEED_PROJECTS) {
      const url = `${b}/projects/${p.slug}`;
      const txt = `${p.title} ${p.summary} ${p.description} ${p.category} ${(p.technologies ?? []).join(" ")} ${p.status}`.toLowerCase();
      docs.push({
        id: `project:${p.slug}`,
        type: "project",
        title: p.title,
        url,
        urlPath: `/projects/${p.slug}`,
        text: clean(txt),
        keywords: ["project", p.slug].map(clean),
        snippet: p.summary,
      });
    }
  }

  // Published achievements
  try {
    const achs = await prisma.achievement.findMany({
      where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      select: { id: true, slug: true, title: true, description: true, content: true, category: true },
    });
    for (const a of achs) {
      const url = `${b}/achievements/${a.slug}`;
      const txt = `${a.title} ${a.description} ${a.content} ${a.category}`.toLowerCase();
      docs.push({
        id: `achievement:${a.id}`,
        type: "achievement",
        title: a.title,
        url,
        urlPath: `/achievements/${a.slug}`,
        text: clean(txt),
        keywords: ["achievement", a.slug].map(clean),
        snippet: a.description,
      });
    }
  } catch (e) {
    // ignore
  }

  cache = { ts: now, docs };
  return docs;
}
