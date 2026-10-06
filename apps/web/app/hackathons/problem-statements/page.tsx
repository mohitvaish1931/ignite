import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, Download, ExternalLink } from "lucide-react";
import { HACKATHON_REGISTER_URL, RULEBOOK_PATH } from "../../../lib/hackathon-rules";
import { PS_COUNT, PS_PDF_FILENAME, PS_PDF_PAGES, PS_PDF_PATH, PS_THEME_COUNT } from "../../../lib/problem-statements";
import ProblemStatementsBrowser from "./ProblemStatementsBrowser";

const description = `All ${PS_COUNT} problem statements for the IEEE IGNITE Hackathon 2026 (14-15 October, SKIT Jaipur) across ${PS_THEME_COUNT} themes: AI & cybercrime, smart energy & EV, IoT & automation, and robotics & smart campus.`;

export const metadata: Metadata = {
  // Absolute: the hackathons layout sets a plain title, so the root "%s | IEEE IGNITE '26" template stops there
  title: { absolute: "Hackathon Problem Statements | IEEE IGNITE '26" },
  description,
  openGraph: { title: "IEEE IGNITE Hackathon 2026: Problem Statements", description },
};

const STATS = [
  { value: String(PS_COUNT), label: "Problem statements" },
  { value: String(PS_THEME_COUNT).padStart(2, "0"), label: "Themes" },
  { value: "24 HRS", label: "Build window" },
  { value: "14-15 OCT", label: "SKIT Jaipur" },
];

export default function ProblemStatementsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 text-white sm:px-8 sm:pt-10">
      <Link href="/events?tab=hackathons" className="ignite-link mb-6 inline-flex items-center gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Hackathon
      </Link>

      {/* Announcement hero */}
      <section className="ignite-panel ignite-hud-bracket relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-[90px]" aria-hidden="true" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-hud text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Problem statements are live</span>
          </div>
          <p className="ignite-eyebrow mb-2"><span className="text-orange-500/60">{"////"}</span> IEEE IGNITE Hackathon 2026</p>
          <h1 className="ignite-title text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Problem <span className="text-orange-500">Statements</span>
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
            {PS_COUNT} real-world challenges across {PS_THEME_COUNT} themes, from AI against financial fraud to EV diagnostics, smart IoT and campus apps.
            Go through them with your team before the event. Your team selects one problem statement, and that choice is final.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={PS_PDF_PATH}
              target="_blank"
              rel="noopener"
              className="ignite-btn-primary group flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-orbitron text-xs font-bold uppercase tracking-wider text-black sm:text-sm"
            >
              <ExternalLink className="h-4 w-4" /> Open PDF
            </a>
            <a
              href={PS_PDF_PATH}
              download={PS_PDF_FILENAME}
              className="ignite-btn-secondary flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-orbitron text-xs font-bold uppercase tracking-wider text-neutral-200 sm:text-sm"
            >
              <Download className="h-4 w-4" /> Download PDF
              <span className="font-hud text-[10px] font-semibold tracking-widest text-slate-400">{PS_PDF_PAGES} pages</span>
            </a>
            <a
              href={HACKATHON_REGISTER_URL}
              className="ignite-btn-secondary group flex items-center justify-center gap-1.5 rounded-sm px-6 py-3 font-orbitron text-xs font-bold uppercase tracking-wider text-neutral-200 sm:text-sm"
            >
              Register now <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATS.map((s) => (
              // Value shown above its label, while the markup keeps term-then-value order
              <div key={s.label} className="flex flex-col-reverse rounded-sm border border-white/10 bg-black/30 px-3 py-2.5">
                <dt className="font-hud text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{s.label}</dt>
                <dd className="font-orbitron text-lg font-bold text-orange-400 sm:text-xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProblemStatementsBrowser />

      {/* The PDF stays the official copy */}
      <section className="mt-14 flex flex-col items-start gap-4 rounded-sm border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">The PDF is the official document</p>
          <p className="mt-1 text-sm text-slate-400">If anything on this page differs from it, the PDF applies. Read the rulebook for team, ID and judging rules.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a href={PS_PDF_PATH} download={PS_PDF_FILENAME} className="ignite-btn-secondary flex items-center gap-2 rounded-sm px-4 py-2.5 font-orbitron text-[11px] font-bold uppercase tracking-wider text-neutral-200">
            <Download className="h-4 w-4" /> PDF
          </a>
          <Link href={RULEBOOK_PATH} className="ignite-btn-secondary flex items-center gap-2 rounded-sm px-4 py-2.5 font-orbitron text-[11px] font-bold uppercase tracking-wider text-neutral-200">
            <BookOpen className="h-4 w-4" /> Rulebook
          </Link>
        </div>
      </section>
    </div>
  );
}
