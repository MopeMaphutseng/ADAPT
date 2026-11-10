import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_ROLE === "admin") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/uploads/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}