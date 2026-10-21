import { prisma } from "@/lib/db";
import {
  BRAND_LONG,
  BRAND_PHILOSOPHY,
  BRAND_TAGLINE,
  BRAND_TALENT,
  BRAND_POSITION,
  COMPANY_NAME,
  FOUNDER_NAME,
  FOUNDER_TITLE,
  LOCATION,
  PRIMARY_EMAIL,
  ROADMAP_DEFAULT,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Typed site content. All editable via the admin dashboard (Site Content).
// ---------------------------------------------------------------------------

export interface SocialLinks {
  linkedin: string;
  x: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  github: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  brandStatement: string;
  localTalent: string;
  philosophy: string;
  longVision: string;
  position: string;
  location: string;
  email: string;
  intro: string;
  heroSupport: string;
  vision: string;
}

export interface FounderInfo {
  name: string;
  title: string;
  company: string;
  email: string;
  location: string;
  bio: string;
  image?: string;
  highlights: string[];
}

export interface ContactInfo {
  email: string;
  location: string;
  founderName: string;
  founderTitle: string;
  company: string;
  thankyou: string;
}

export interface InvestorInfo {
  headline: string;
  subhead: string;
  whyAdapt: string[];
  whatWeAreBuilding: string[];
  opportunities: {
    fundingStage: string;
    amountRaised: string;
    structure: string;
    marketOpportunity: string;
    milestones: string;
    roadmap: string;
  };
  useOfFunds: string[];
  ctaTitle: string;
  ctaBody: string;
}

export interface RoadmapInfo {
  phases: {
    key: string;
    label: string;
    title: string;
    items: string[];
  }[];
}

export interface LegalInfo {
  privacy: string;
  terms: string;
  cookies: string;
}

export interface AnalyticsInfo {
  enabled: boolean;
  provider: string;
  scriptId: string;
}

export interface HomeInfo {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSupport: string;
  visionTitle: string;
  visionText: string;
}

export interface SiteContent {
  company: CompanyInfo;
  founder: FounderInfo;
  contact: ContactInfo;
  social: SocialLinks;
  investor: InvestorInfo;
  roadmap: RoadmapInfo;
  legal: LegalInfo;
  home: HomeInfo;
  analytics: AnalyticsInfo;
}

// ---------------------------------------------------------------------------
// Defaults (used when a setting has not been customised yet)
// ---------------------------------------------------------------------------

export const DEFAULT_FOUNDER_BIO = `Mope Samuel Maphutseng is the Founder & CEO of ADAPT Technologies, an African technology and engineering company based in Lesotho. He is an emerging engineer, software developer, AI builder, electronics enthusiast and robotics/automation developer whose work follows a simple conviction: Africa should not only consume technology — Africa should build it.

Mope's building journey spans software engineering, artificial intelligence, electronics and embedded systems, giving him a deliberately multidisciplinary view of how technology products come together — from an idea on a screen to a working system in the physical world.

His focus at ADAPT Technologies is on developing intelligent software, hardware and engineering systems from Lesotho with ambitions to scale across Africa and, eventually, to global markets.`;

const DEFAULT_CONTENT: SiteContent = {
  company: {
    name: COMPANY_NAME,
    tagline: BRAND_TAGLINE,
    brandStatement:
      "We build intelligent software, hardware and engineering systems designed to solve real-world problems.",
    localTalent: BRAND_TALENT,
    philosophy: BRAND_PHILOSOPHY,
    longVision: BRAND_LONG,
    position: BRAND_POSITION,
    location: LOCATION,
    email: PRIMARY_EMAIL,
    intro:
      "ADAPT Technologies is an African technology and engineering company building intelligent software, hardware and systems that solve real-world problems.",
    heroSupport:
      "ADAPT Technologies is an African technology and engineering company building intelligent software, hardware, and systems that solve real-world problems.",
    vision:
      "Africa should not only consume technology. Africa should build it — develop its own products, engineer its own systems and create the intelligent infrastructure of the future.",
  },
  founder: {
    name: FOUNDER_NAME,
    title: FOUNDER_TITLE,
    company: "ADAPT Technologies",
    email: PRIMARY_EMAIL,
    location: LOCATION,
    bio: DEFAULT_FOUNDER_BIO,
    image: "",
    highlights: [
      "Software development",
      "AI & machine learning",
      "Electronics & embedded systems",
      "Robotics & automation",
      "Technology entrepreneurship",
    ],
  },
  contact: {
    company: "ADAPT Technologies",
    founderName: "Mope Samuel Maphutseng",
    founderTitle: "Founder & CEO",
    email: PRIMARY_EMAIL,
    location: "Lesotho",
    thankyou:
      "Thank you for contacting ADAPT Technologies. Your message has been received and our team will review it.",
  },
  social: {
    linkedin: "",
    x: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    github: "",
  },
  investor: {
    headline: "Help Build Africa's Next Generation of Technology.",
    subhead:
      "ADAPT Technologies is developing intelligent software, hardware and engineering solutions from Lesotho with ambitions to scale across Africa and beyond.",
    whyAdapt: [
      "A growing African technology market",
      "Multidisciplinary engineering — software, electronics, AI, robotics",
      "AI and automation as a core product direction",
      "Local talent with global vision",
      "Scalable software products",
      "Hardware innovation",
      "Emerging technology opportunity",
    ],
    whatWeAreBuilding: [
      "AI platforms and intelligent software",
      "Embedded systems and IoT devices",
      "Robotics and autonomous systems",
      "Cybersecurity engineering",
      "Industrial automation",
      "Agricultural technology",
      "Education technology",
      "Energy technology",
      "Digital transformation",
    ],
    opportunities: {
      fundingStage: "",
      amountRaised: "",
      structure: "",
      marketOpportunity: "",
      milestones: "",
      roadmap: "",
    },
    useOfFunds: [
      "Product development",
      "Engineering equipment",
      "Research & development",
      "Talent",
      "Infrastructure",
      "Marketing",
      "Manufacturing/prototyping",
      "Expansion",
    ],
    ctaTitle: "Build the Future With Us",
    ctaBody:
      "ADAPT Technologies is developing technology and engineering solutions from Lesotho with ambitions to scale across Africa and beyond. If you believe in building African technology, we would like to hear from you.",
  },
  roadmap: ROADMAP_DEFAULT,
  legal: {
    privacy:
      "Privacy Policy placeholder. This page will describe how ADAPT Technologies collects and handles personal information. It will be updated by the administrator.",
    terms:
      "Terms of Service placeholder. This page will define the terms governing use of ADAPT Technologies' website and services. It will be updated by the administrator.",
    cookies:
      "Cookie Policy placeholder. This page will describe how cookies are used on this website. It will be updated by the administrator.",
  },
  home: {
    heroEyebrow: "ADAPT TECHNOLOGIES — LESOTHO",
    heroTitle: "Intelligent Solutions. Real Impact.",
    heroSubtitle:
      "We build intelligent software, hardware and engineering systems designed to solve real-world problems.",
    heroSupport:
      "Artificial intelligence · Software · Electronics · Embedded systems · IoT · Robotics · Cybersecurity",
    visionTitle: "Africa should build technology.",
    visionText:
      "Technology should not only be consumed. ADAPT Technologies exists to build, engineer and invent — from Lesotho, for Africa, for the world.",
  },
  analytics: {
    enabled: false,
    provider: "",
    scriptId: "",
  },
};

// ---------------------------------------------------------------------------
// Loader / updater
// ---------------------------------------------------------------------------

function mergeJSON<T extends Record<string, unknown>>(fallback: T, stored?: unknown): T {
  if (stored == null) return fallback;
  if (typeof stored !== "object" || Array.isArray(stored)) return fallback;
  return { ...fallback, ...(stored as Partial<T>) };
}

export async function getAllSettings(): Promise<SiteContent> {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    company: mergeJSON(DEFAULT_CONTENT.company as unknown as Record<string, unknown>, map.get("company")) as unknown as CompanyInfo,
    founder: mergeJSON(DEFAULT_CONTENT.founder as unknown as Record<string, unknown>, map.get("founder")) as unknown as FounderInfo,
    contact: mergeJSON(DEFAULT_CONTENT.contact as unknown as Record<string, unknown>, map.get("contact")) as unknown as ContactInfo,
    social: mergeJSON(DEFAULT_CONTENT.social as unknown as Record<string, unknown>, map.get("social")) as unknown as SocialLinks,
    investor: mergeJSON(DEFAULT_CONTENT.investor as unknown as Record<string, unknown>, map.get("investor")) as unknown as InvestorInfo,
    roadmap: mergeJSON(DEFAULT_CONTENT.roadmap as unknown as Record<string, unknown>, map.get("roadmap")) as unknown as RoadmapInfo,
    legal: mergeJSON(DEFAULT_CONTENT.legal as unknown as Record<string, unknown>, map.get("legal")) as unknown as LegalInfo,
    home: mergeJSON(DEFAULT_CONTENT.home as unknown as Record<string, unknown>, map.get("home")) as unknown as HomeInfo,
    analytics: mergeJSON(DEFAULT_CONTENT.analytics as unknown as Record<string, unknown>, map.get("analytics")) as unknown as AnalyticsInfo,
  };
}

export function getDefaultContent(): SiteContent {
  return structuredClone(DEFAULT_CONTENT);
}

export async function upsertSetting(
  key: string,
  value: unknown,
  updatedById?: string,
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as object, updatedById },
    update: { value: value as object, updatedById },
  });
}

export const SETTING_KEYS = [
  "company",
  "founder",
  "contact",
  "social",
  "investor",
  "roadmap",
  "legal",
  "home",
  "analytics",
] as const;