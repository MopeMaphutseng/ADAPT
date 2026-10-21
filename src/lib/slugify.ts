export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueSlug(base: string, existing?: string): string {
  const clean = slugify(base) || "item";
  if (!existing || existing === clean) return clean;
  return `${clean}-${Date.now().toString(36).slice(-6)}`;
}