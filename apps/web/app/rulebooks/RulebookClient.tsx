"use client";

import React, { useEffect, useState } from "react";
import { Check, Printer } from "lucide-react";

/** Section links that follow the reader: the section in view is highlighted. */
export function RulebookToc({ sections }: { sections: { id: string; number: number; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Rulebook sections">
      <p className="ignite-label mb-3">Contents</p>
      <ol className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`flex items-baseline gap-3 rounded-sm border-l-2 px-3 py-1.5 font-hud text-sm font-semibold uppercase tracking-wider transition-colors ${
                active === s.id ? "border-orange-500 bg-orange-500/10 text-orange-300" : "border-white/10 text-slate-400 hover:border-orange-500/50 hover:text-white"
              }`}
            >
              <span className="font-orbitron text-[10px] text-orange-500/80">{String(s.number).padStart(2, "0")}</span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A packing checklist; ticks are remembered on this device only. */
export function Checklist({ title, items, storageKey }: { title: string; items: string[]; storageKey: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      // Restoring browser-only state has to wait until after hydration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setChecked(items.map((_, i) => saved[i] === true));
    } catch {
      // Storage unavailable (private mode, blocked site data): start unticked
    }
  }, [items, storageKey]);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* not persisted */ }
      return next;
    });
  };

  const done = checked.filter(Boolean).length;

  return (
    <div className="rounded-sm border border-orange-500/30 bg-orange-500/[0.05] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">{title}</p>
        <span className="font-hud text-xs font-bold uppercase tracking-[0.2em] text-orange-400 print:hidden">{done}/{items.length} packed</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 rounded-sm p-1.5 transition-colors hover:bg-white/[0.04]">
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/60 ${
                  checked[i] ? "border-orange-500 bg-orange-500 text-black" : "border-white/25 bg-black/40"
                }`}
              >
                {checked[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className={`text-sm ${checked[i] ? "text-slate-500 line-through print:no-underline print:text-inherit" : "text-slate-200"}`}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="h-4 w-4" /> PRINT / SAVE PDF
    </button>
  );
}
