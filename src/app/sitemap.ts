import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/achievements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/investors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const [projects, achievements] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      select: { slug: true, updatedAt: true },
    }),
    prisma.achievement.findMany({
      where: { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const projectRoutes = projects.map<MetadataRoute.Sitemap[number]>((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const achievementRoutes = achievements.map<MetadataRoute.Sitemap[number]>((a) => ({
    url: `${base}/achievements/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...achievementRoutes];
}