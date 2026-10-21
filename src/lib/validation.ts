import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(120, "Name is too long."),
  email: z.string().email("Please enter a valid email.").max(160, "Email is too long."),
  phone: z.string().max(40, "Phone number is too long.").optional().or(z.literal("")),
  organization: z.string().max(120, "Organization is too long.").optional().or(z.literal("")),
  subject: z.string().min(3, "Subject must be at least 3 characters.").max(160, "Subject is too long."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(4000, "Message is too long."),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email.").max(160),
  password: z.string().min(6, "Password must be at least 6 characters.").max(200),
});

export const idParam = z.string().min(1, "Missing id.").or(z.object({ id: z.string().min(1, "Missing id.") }));

export function parseDateParam(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export const projectSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated.")
    .optional()
    .or(z.literal("")),
  title: z.string().min(1, "Title is required.").max(160),
  summary: z.string().min(1, "Summary is required.").max(280),
  description: z.string().min(1, "Description is required.").max(8000),
  status: z
    .enum(["IDEA", "RESEARCH", "PROTOTYPE", "DEVELOPMENT", "TESTING", "BETA", "PRODUCTION", "COMPLETED"])
    .optional(),
  category: z.string().max(80).optional().or(z.literal("")),
  technologies: z.array(z.string()).optional().default([]),
  coverImage: z.string().max(500).optional().or(z.literal("")),
  gallery: z.unknown().optional(),
  videoUrl: z.string().max(500).optional().or(z.literal("")),
  externalUrl: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  views: z.coerce.number().int().min(0).optional(),
});

export const achievementSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated.")
    .optional()
    .or(z.literal("")),
  title: z.string().min(1, "Title is required.").max(160),
  description: z.string().min(1, "Description is required.").max(600),
  content: z.string().min(1, "Content is required.").max(8000),
  category: z
    .enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "MILESTONE", "AWARD", "PRODUCT_LAUNCH", "PARTNERSHIP", "COMPANY_NEWS"])
    .optional(),
  occurredOn: z.string().min(1, "Date is required."),
  coverImage: z.string().max(500).optional().or(z.literal("")),
  gallery: z.unknown().optional(),
  videoUrl: z.string().max(500).optional().or(z.literal("")),
  externalUrl: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  author: z.string().max(120).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  views: z.coerce.number().int().min(0).optional(),
});

export const announcementSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated.")
    .optional()
    .or(z.literal("")),
  title: z.string().min(1, "Title is required.").max(160),
  body: z.string().min(2, "Body is required.").max(8000),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().or(z.literal("")),
});

export const investorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(120),
  organization: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email.").max(160),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  investorType: z
    .enum(["ANGEL_INVESTOR", "VENTURE_CAPITAL", "CORPORATE_INVESTOR", "STRATEGIC_PARTNER", "TECHNOLOGY_PARTNER", "OTHER"])
    .optional(),
  interest: z.string().max(400).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
});

export { searchQuerySchema, type SearchQuery } from "@/lib/validation/search";
