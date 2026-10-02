import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Gavel, ShieldCheck, X } from "lucide-react";
import { GUIDES, getGuide, hasDocument } from "../../../lib/guides";
import type { EventGuide, GuideBlock, GuideSection } from "../../../lib/guides/types";
import { Checklist, PrintButton, RulebookToc } from "../RulebookClient";
import { ProgrammeTimeline } from "../../components/ProgrammeTimeline";

// Every rulebook is known at build time; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.filter(hasDocument).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: { absolute: `${guide.sections.some((s) => s.id === "programme") ? "Programme" : "Rulebook"} | ${guide.name}` },
    description: `${guide.kicker} for ${guide.name}: ${guide.tagline}.`,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Block({ block, guide }: { block: GuideBlock; guide: EventGuide }) {
  switch (block.type) {
    case "points":
      return (
        <div>
          {block.intro && <p className="mb-3 text-slate-300">{block.intro}</p>}
          <ul className="space-y-3">
            {block.items.map((p) => (
              <li key={p.text} className="flex gap-3 text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-orange-500" aria-hidden="true" />
                <span>
                  {p.title && <strong className="font-semibold text-white">{p.title}: </strong>}
                  {p.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "table":
      return (
        <>
          {/* Phones: one card per row */}
          <div className="space-y-3 md:hidden">
            {block.rows.map((row) => (
              <dl key={row.join()} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                {row.map((cell, i) => (
                  <div key={block.columns[i]} className={i ? "mt-2" : ""}>
                    <dt className="font-hud text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">{block.columns[i]}</dt>
                    <dd className={i ? "text-sm text-slate-300" : "font-semibold text-white"}>{cell}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-sm border border-white/10 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04]">
                <tr>
                  {block.columns.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-hud text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.join()} className="border-t border-white/10 align-top">
                    {row.map((cell, i) => (
                      <td key={block.columns[i]} className={`px-4 py-3 ${i ? "text-slate-300" : "whitespace-nowrap font-semibold text-white"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "compare":
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { heading: "Permitted", items: block.allowed, Icon: Check, tone: "border-emerald-500/30 bg-emerald-500/[0.05]", icon: "text-emerald-400" },
            { heading: "Not permitted", items: block.notAllowed, Icon: X, tone: "border-red-500/30 bg-red-500/[0.05]", icon: "text-red-400" },
          ].map(({ heading, items, Icon, tone, icon }) => (
            <div key={heading} className={`rounded-sm border p-5 ${tone}`}>
              <p className={`mb-3 font-orbitron text-sm font-bold uppercase tracking-wider ${icon}`}>{heading}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-200">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} strokeWidth={3} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "cards":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {block.items.map((c, i) => (
            <div key={c.title} className="ignite-hud-bracket rounded-sm border border-white/10 bg-white/[0.03] p-4">
              <p className="font-orbitron text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">{block.label} {pad(i + 1)}</p>
              <p className="mt-1 font-orbitron text-sm font-bold uppercase tracking-wider text-white">{c.title}</p>
              <p className="mt-1 text-sm text-slate-400">{c.text}</p>
            </div>
          ))}
        </div>
      );

    case "checklist":
      return <Checklist title={block.title} items={block.items} storageKey={`ignite-checklist-${guide.slug}`} />;

    case "chips":
      return (
        <div>
          <p className="ignite-label mb-3">{block.label}</p>
          <ul className="flex flex-wrap gap-2">
            {block.items.map((item) => (
              <li key={item} className="rounded-sm border border-orange-500/25 bg-orange-500/[0.06] px-3 py-1.5 font-hud text-sm font-bold uppercase tracking-wider text-orange-200">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "timeline":
      return <ProgrammeTimeline items={block.items} />;

    case "note":
      return (
        <div className="flex gap-3 rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
          <p>
            {block.title && <strong className="font-semibold text-white">{block.title}: </strong>}
            {block.text}
          </p>
        </div>
      );
  }
}

function Section({ section, guide }: { section: GuideSection; guide: EventGuide }) {
  return (
    <section id={section.id} className="ignite-panel scroll-mt-28 p-6 break-inside-avoid sm:p-8">
      <div className="mb-4 flex items-start gap-4">
        <span className="print-accent font-orbitron text-3xl font-black leading-none text-orange-500/80">{pad(section.number)}</span>
        <h2 className="ignite-title pt-1 text-xl sm:text-2xl">{section.title}</h2>
      </div>
      {section.lead && <p className="border-l-2 border-orange-500/60 pl-4 font-medium text-slate-100">{section.lead}</p>}
      {section.blocks.length > 0 && (
        <div className={`space-y-5 ${section.lead ? "mt-5" : ""}`}>
          {section.blocks.map((block, i) => (
            <Block key={`${block.type}-${i}`} block={block} guide={guide} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function RulebookPage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide || !hasDocument(guide)) notFound();

  return (
    <div className="rulebook mx-auto w-full max-w-[1400px] px-4 pb-24 pt-10 sm:px-8">
      {/* Cover */}
      <header className="ignite-panel ignite-hud-bracket relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-600/20 blur-[100px] print:hidden" aria-hidden="true" />
        <p className="ignite-eyebrow mb-4"><span className="text-orange-500/60">{"////"}</span> {guide.kicker}</p>
        <h1 className="ignite-title text-3xl leading-tight sm:text-5xl lg:text-6xl">
          {guide.title.lead} <span className="print-accent text-orange-500">{guide.title.accent}</span>
        </h1>
        <p className="mt-3 font-hud text-base font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-lg">{guide.tagline}</p>
        {guide.organizedBy && <p className="mt-2 max-w-3xl text-sm text-slate-400">{guide.organizedBy}</p>}

        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Link href={guide.cta.href} className="ignite-btn-primary rounded-sm px-6 py-3 font-orbitron text-xs font-bold tracking-wider text-black sm:text-sm">
            {guide.cta.label}
          </Link>
          <PrintButton className="ignite-btn-secondary flex items-center gap-2 rounded-sm px-6 py-3 font-orbitron text-xs font-bold tracking-wider text-neutral-200 sm:text-sm" />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {guide.facts.map((f) => (
            <div key={f.label} className={`rounded-sm border border-white/10 bg-black/40 p-4 ${f.wide ? "col-span-2" : ""}`}>
              <dt className="font-hud text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">{f.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-white sm:text-base">{f.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain pr-1">
            <RulebookToc sections={guide.sections.map(({ id, number, title }) => ({ id, number, title }))} />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {/* Phones and tablets: jump links instead of the sidebar */}
          <nav aria-label="Rulebook sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden print:hidden">
            {guide.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 font-hud text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-orange-500/50 hover:text-orange-300">
                {pad(s.number)} {s.title}
              </a>
            ))}
          </nav>

          <section className="ignite-panel p-6 sm:p-8">
            <h2 className="ignite-title mb-4 text-xl sm:text-2xl">About</h2>
            <p className="leading-relaxed text-slate-300">{guide.about}</p>
            {guide.agreement && (
              <div className="mt-5 flex gap-3 rounded-sm border border-orange-500/30 bg-orange-500/[0.07] p-4 text-sm text-orange-100">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
                <p>{guide.agreement}</p>
              </div>
            )}
          </section>

          {guide.sections.map((section) => (
            <Section key={section.id} section={section} guide={guide} />
          ))}

          {guide.closing && (
            <div className="space-y-1 border-t border-white/10 pt-6 text-center font-hud text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              {guide.closing.map((line) => <p key={line}>{line}</p>)}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-2 text-center print:hidden">
            <Link href={guide.cta.href} className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black">
              {guide.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
