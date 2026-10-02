import type { ProgrammeItem } from "../../lib/guides/types";

/** A timed programme, slot by slot; the headline sessions stand out. Works on server and client pages. */
export function ProgrammeTimeline({ items }: { items: ProgrammeItem[] }) {
  return (
    <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-gradient-to-b before:from-orange-500/70 before:via-orange-500/30 before:to-transparent">
      {items.map((item) => (
        <li key={item.time} className="relative pl-8">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-4 h-[15px] w-[15px] rotate-45 border ${item.highlight ? "border-orange-400 bg-orange-500 shadow-[0_0_10px_#f97316]" : "border-orange-500/60 bg-[#07080d]"}`}
          />
          <div className={`rounded-sm border p-4 break-inside-avoid ${item.highlight ? "border-orange-500/40 bg-orange-500/[0.07]" : "border-white/10 bg-white/[0.03]"}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-orbitron text-xs font-bold tracking-wider text-orange-400">{item.time}</span>
              <span className="rounded-sm border border-white/10 px-1.5 py-0.5 font-hud text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.duration}</span>
            </div>
            <p className="mt-1.5 font-orbitron text-sm font-bold uppercase tracking-wider text-white">{item.title}</p>
            <p className="mt-1 text-sm text-slate-400">{item.details}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
