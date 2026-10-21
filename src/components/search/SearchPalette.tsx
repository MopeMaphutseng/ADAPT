"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, CornerDownLeft, ArrowUpRight, FileText, FolderKanban, Trophy, Briefcase } from "lucide-react";
import { api } from "@/lib/client";

export interface SearchItem {
  id: string;
  title: string;
  url: string;
  type: "page" | "project" | "achievement" | "service" | "announcement";
  snippet: string;
  score: number;
}

export interface SearchApiResp {
  query: string;
  answer: string;
  provider: string | null;
  results: SearchItem[];
}

function typeIcon(t: SearchItem["type"]) {
  if (t === "project") return <FolderKanban className="h-4 w-4" aria-hidden="true" />;
  if (t === "achievement") return <Trophy className="h-4 w-4" aria-hidden="true" />;
  if (t === "service") return <Briefcase className="h-4 w-4" aria-hidden="true" />;
  if (t === "announcement") return <FileText className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

function typeLabel(t: SearchItem["type"]) {
  if (t === "project") return "Project";
  if (t === "achievement") return "Achievement";
  if (t === "service") return "Service";
  if (t === "announcement") return "News";
  return "Page";
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const results = data?.results ?? [];

  const doSearch = useCallback(async (q: string) => {
    const s = q.trim();
    if (s.length < 2) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ query: string; answer: string; provider: string | null; results: SearchItem[] }>("/api/search", { method: "POST", body: { query: s } });
      setData(res);
      setActiveIdx(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setData(null);
      setError(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (results[activeIdx]) {
          e.preventDefault();
          window.location.href = results[activeIdx].url;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, results, activeIdx]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setData(null);
      return;
    }
    debounceRef.current = window.setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-16 md:pt-24">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-ink-900/95 shadow-[0_40px_120px_-60px_rgba(56,225,255,0.6)]"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, services, achievements, pages… (Ctrl/Cmd+K)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {loading ? (
            <span className="text-xs text-slate-500">Searching…</span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
              <kbd className="rounded border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5">Esc</kbd> to close
            </span>
          )}
        </div>
        <div className="border-t border-white/[0.08]" />
        {data?.answer ? (
          <div className="flex items-start gap-3 px-4 py-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-cyanx" aria-hidden="true" />
            <div>
              <p className="text-sm leading-relaxed text-slate-200">{data.answer}</p>
              {data.provider ? (
                <p className="mt-1 text-[0.75rem] uppercase tracking-widest text-slate-500">Powered by {data.provider}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {query.length >= 2 && !loading && results.length === 0 && !error ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No results found.</div>
          ) : null}
          {error ? (
            <div className="px-4 py-6 text-center text-sm text-rose-400">{error}</div>
          ) : null}
          <ul className="flex flex-col">
            {results.map((r, i) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`group flex items-start gap-3 px-4 py-3 transition-colors ${
                    activeIdx === i ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] text-slate-300">
                    {typeIcon(r.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">{r.title}</span>
                      <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] text-slate-400">
                        {typeLabel(r.type)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{r.snippet}</p>
                  </div>
                  <span className="mt-1 hidden items-center gap-1 text-xs text-slate-500 group-hover:flex">
                    Open <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-slate-600 group-hover:hidden">
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {results.length > 0 ? (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 text-[0.75rem] text-slate-500">
            <span>Use ↑ ↓ to navigate · Enter to open</span>
            <span>Ctrl/Cmd+K anytime</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SearchTriggerButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open site search"
      className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] px-2.5 py-2 text-sm text-slate-300 transition-colors hover:border-accent-500 hover:text-white"
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden xl:inline-flex items-center gap-1 rounded border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.7rem] text-slate-400">
        ⌘K
      </kbd>
    </button>
  );
}
