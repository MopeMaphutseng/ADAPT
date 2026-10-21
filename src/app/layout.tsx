import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageTracker } from "@/components/analytics/PageTracker";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { getAllSettings } from "@/lib/settings";
import { SITE_DESCRIPTION } from "@/lib/seo";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ADAPT Technologies",
    template: "%s | ADAPT Technologies",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "ADAPT Technologies",
    description: SITE_DESCRIPTION,
    siteName: "ADAPT Technologies",
    locale: "en_ZA",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "ADAPT Technologies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADAPT Technologies",
    description: SITE_DESCRIPTION,
    images: ["/og-default.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getAllSettings();
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-ink-950">
        <AnalyticsScripts settings={settings} />
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
        <PageTracker />
      </body>
    </html>
  );
}