import { buildIndex, type SearchDocument } from "./content";
import { rank, type ScoredDoc } from "./rank";
import { completeWithFallback, type ChatMessage } from "@/lib/ai/providers";
import { getEnv } from "@/lib/env";

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  type: SearchDocument["type"];
  snippet: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  answer: string;
  provider: string | null;
  results: SearchResultItem[];
}

function truncate(s: string, n = 200) {
  const x = s.replace(/\s+/g, " ").trim();
  return x.length > n ? x.slice(0, n) + "…" : x;
}

export async function searchSite(query: string): Promise<SearchResponse> {
  const q = query.trim();
  const docs = await buildIndex();
  const shortlist = rank(q, docs, 10);
  if (shortlist.length === 0) {
    return { query: q, answer: "", provider: null, results: [] };
  }

  const enabled = getEnv("SEARCH_ENABLED", "true").toLowerCase() !== "false";
  if (!enabled) {
    const results = shortlist.map<SearchResultItem>((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      type: d.type,
      snippet: truncate(d.snippet || d.text),
      score: d.score,
    }));
    return { query: q, answer: "", provider: null, results };
  }

  // Build context
  const context = shortlist
    .map(
      (d, i) =>
        `[${i + 1}] id=${d.id} type=${d.type} title=${d.title} url=${d.url} path=${d.urlPath}\ntext:${d.text}`,
    )
    .join("\n---\n");

  const sys: ChatMessage = {
    role: "system",
    content:
      "You are a helpful site search assistant for ADAPT Technologies (https://adapt-technologies.example/). " +
      "Only use the provided documents. Return valid JSON with keys: answer (short, 1-3 sentences), results (array of {id, reason}). " +
      "Pick at most 5 best results (by relevance to user query) from the provided documents; do not invent URLs or facts. " +
      "Prefer exact matches to titles/technologies. Keep answer concise.",
  };
  const user: ChatMessage = {
    role: "user",
    content: `User query: "${q}"\n\nDocuments:\n${context}\n\nReturn JSON only.`,
  };

  try {
    const { content, provider } = await completeWithFallback([sys, user]);
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // try to extract JSON
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw e;
    }
    const picked = Array.isArray(parsed?.results) ? parsed.results : [];
    const idToDoc = new Map(shortlist.map((d) => [d.id, d]));
    const chosen: ScoredDoc[] = [];
    for (const p of picked.slice(0, 5)) {
      if (p?.id && idToDoc.has(p.id)) {
        chosen.push(idToDoc.get(p.id)!);
      }
    }
    if (chosen.length === 0) {
      // fallback to top 3 shortlist
      chosen.push(...shortlist.slice(0, 3));
    }
    const results = chosen.map<SearchResultItem>((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      type: d.type,
      snippet: truncate(d.snippet || d.text),
      score: d.score,
    }));
    return { query: q, answer: String(parsed?.answer ?? "").trim(), provider, results };
  } catch (err) {
    // Fallback to keyword results
    const chosen = shortlist.slice(0, 5);
    const results = chosen.map<SearchResultItem>((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      type: d.type,
      snippet: truncate(d.snippet || d.text),
      score: d.score,
    }));
    return { query: q, answer: "", provider: null, results };
  }
}
