import { SEO_KEYWORDS } from "@/lib/constants";

export const SITE_DESCRIPTION =
  "ADAPT Technologies is an African technology and engineering company based in Lesotho — building intelligent software, hardware, automation and emerging technologies that solve real-world problems. Local Talent. Global Vision.";

export function buildMetadata(meta: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const canonical = `${siteUrl}${meta.path}`;
  const image = meta.image
    ? meta.image.startsWith("http")
      ? meta.image
      : `${siteUrl}${meta.image}`
    : `${siteUrl}/og-default.png`;
  return {
    title: meta.title,
    description: meta.description,
    keywords: SEO_KEYWORDS,
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: "ADAPT Technologies",
      type: meta.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: meta.title }],
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}