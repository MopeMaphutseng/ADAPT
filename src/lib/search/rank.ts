import type { SearchDocument } from "./content";

export interface ScoredDoc extends SearchDocument {
  score: number;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s+#]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function rank(query: string, docs: SearchDocument[], limit = 12): ScoredDoc[] {
  const q = tokenize(query);
  if (q.length === 0) return docs.slice(0, limit).map((d) => ({ ...d, score: 0 }));
  const scores = docs.map((d) => {
    let s = 0;
    const titleToks = tokenize(d.title);
    const textToks = tokenize(d.text + " " + d.keywords.join(" "));
    for (const t of q) {
      if (titleToks.includes(t)) s += 3;
      if (d.keywords.some((k) => k.includes(t) || t.includes(k))) s += 2;
      const c = (textToks.join(" ").match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      s += c;
    }
    return { ...d, score: s };
  });
  return scores
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
