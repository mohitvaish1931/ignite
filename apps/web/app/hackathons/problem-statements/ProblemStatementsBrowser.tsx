"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bot, Check, ChevronDown, Cpu, Link2, Search, ShieldAlert, X, Zap } from "lucide-react";
import { PROBLEM_STATEMENTS, PS_THEMES, themeOf, type ProblemStatement, type ThemeId } from "../../../lib/problem-statements";

const THEME_ICONS: Record<ThemeId, React.ComponentType<{ className?: string }>> = {
  "ai-safety": ShieldAlert,
  energy: Zap,
  iot: Cpu,
  campus: Bot,
};

type Filter = ThemeId | "all";

/** Everything a visitor might search for in one statement, lower-cased. */
const searchText = (ps: ProblemStatement) =>
  [ps.id, ps.title, ps.area, themeOf(ps.theme).name, ...ps.description, ...ps.sections.flatMap((s) => [s.heading, s.text, ...(s.items ?? [])]), ps.domain, ps.constraint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const INDEX = PROBLEM_STATEMENTS.map((ps) => ({ ps, text: searchText(ps) }));

function CopyLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard access (e.g. an insecure origin): fall back to putting it in the address bar
      window.location.hash = id;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 font-hud text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-orange-300"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

function StatementCard({ ps, open, onToggle }: { ps: ProblemStatement; open: boolean; onToggle: (open: boolean) => void }) {
  const Icon = THEME_ICONS[ps.theme];
  return (
    <details
      id={ps.id}
      open={open}
      onToggle={(e) => onToggle(e.currentTarget.open)}
      className="group scroll-mt-48 rounded-sm border border-white/10 bg-[#07080d]/80 transition-colors open:border-orange-500/40 open:bg-[#0b0906] hover:border-orange-500/30 target:border-orange-500/70"
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 rounded-sm border border-orange-500/30 bg-orange-500/[0.08] py-2 sm:w-20">
          <Icon className="h-4 w-4 text-orange-400" />
          <span className="font-orbitron text-[11px] font-bold tracking-wider text-orange-300 sm:text-xs">{ps.id}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-hud text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">{themeOf(ps.theme).short}</p>
          <h3 className="mt-0.5 font-orbitron text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-base">{ps.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-400 group-open:hidden">{ps.description[0]}</p>
        </div>
        <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180 group-open:text-orange-400" aria-hidden="true" />
      </summary>

      <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5 sm:pl-[7.25rem]">
        {ps.area && <p className="mb-2 font-hud text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{ps.area}</p>}
        <div className="space-y-3 text-[15px] leading-relaxed text-slate-300">
          {ps.description.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {ps.sections.map((section) => (
          <div key={section.heading} className="mt-5">
            <p className="mb-2 font-hud text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{section.heading}</p>
            {section.items ? (
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-orange-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-slate-300">{section.text}</p>
            )}
          </div>
        ))}

        {ps.constraint && (
          <div className="mt-5 rounded-sm border border-amber-400/30 bg-amber-400/[0.06] p-3">
            <p className="font-hud text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Important constraint</p>
            <p className="mt-1 text-[15px] text-slate-200">{ps.constraint}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {ps.domain ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Domain">
              {ps.domain.split(",").map((d) => (
                <li key={d} className="rounded-sm border border-white/10 bg-white/[0.04] px-2 py-0.5 font-hud text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {d.trim()}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <CopyLink id={ps.id} />
        </div>
      </div>
    </details>
  );
}

export default function ProblemStatementsBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  // A shared link (…#SKIT004) opens that statement and brings it into view
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1)).toUpperCase();
      if (!PROBLEM_STATEMENTS.some((ps) => ps.id === id)) return;
      setFilter("all");
      setQuery("");
      setOpenIds((prev) => new Set(prev).add(id));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => INDEX.filter(({ ps, text }) => (filter === "all" || ps.theme === filter) && (!q || text.includes(q))).map(({ ps }) => ps),
    [filter, q]
  );
  const groups = PS_THEMES.map((theme) => ({ theme, items: visible.filter((ps) => ps.theme === theme.id) })).filter((g) => g.items.length > 0);
  const allOpen = visible.length > 0 && visible.every((ps) => openIds.has(ps.id));

  const toggle = (id: string, open: boolean) =>
    setOpenIds((prev) => {
      if (prev.has(id) === open) return prev;
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  const setAll = (open: boolean) => setOpenIds(open ? new Set(visible.map((ps) => ps.id)) : new Set());

  const chips: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: PROBLEM_STATEMENTS.length },
    ...PS_THEMES.map((t) => ({ id: t.id, label: t.short, count: PROBLEM_STATEMENTS.filter((ps) => ps.theme === t.id).length })),
  ];

  return (
    <section className="mt-12" aria-labelledby="ps-list-heading">
      <h2 id="ps-list-heading" className="sr-only">All problem statements</h2>

      {/* Sticky controls: search, theme filter, expand all */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-white/10 bg-[#030408]/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 md:top-20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search problem statements</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title or keyword"
              className="w-full rounded-sm border border-white/15 bg-black/50 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setAll(!allOpen)}
            disabled={visible.length === 0}
            className="hidden shrink-0 items-center gap-1.5 rounded-sm border border-white/15 px-3 py-2.5 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-orange-500/50 hover:text-orange-300 disabled:opacity-40 lg:flex"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${allOpen ? "rotate-180" : ""}`} /> {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by theme">
          {chips.map((chip) => {
            const active = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 font-hud text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                  active ? "border-orange-500 bg-orange-500 text-black" : "border-white/15 text-slate-300 hover:border-orange-500/50 hover:text-orange-300"
                }`}
              >
                {chip.label}
                <span className={`rounded-sm px-1.5 font-mono text-[10px] ${active ? "bg-black/20" : "bg-white/10 text-slate-400"}`}>{chip.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500" aria-live="polite">
        Showing {visible.length} of {PROBLEM_STATEMENTS.length}
        {q && <> for &ldquo;{query.trim()}&rdquo;</>}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-sm border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-slate-300">No problem statement matches &ldquo;{query.trim()}&rdquo;{filter !== "all" && <> in {themeOf(filter).short}</>}.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="ignite-link mt-3"
          >
            Show all {PROBLEM_STATEMENTS.length}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-10">
          {groups.map(({ theme, items }) => {
            const Icon = THEME_ICONS[theme.id];
            return (
              <div key={theme.id}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-orange-500/40 bg-orange-500/10">
                    <Icon className="h-4 w-4 text-orange-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">Theme · {items.length} PS</p>
                    <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white sm:text-lg">{theme.name}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {items.map((ps) => (
                    <StatementCard key={ps.id} ps={ps} open={openIds.has(ps.id)} onToggle={(open) => toggle(ps.id, open)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
