import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { GUIDES, guidePath, hasDocument } from "../../lib/guides";

export const metadata: Metadata = {
  title: "Rulebooks & Programmes",
  description: "Official rulebooks, participant guidelines and programme schedules for every IEEE IGNITE '26 event.",
};

export default function RulebooksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-12 sm:px-8">
      <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> IEEE IGNITE &apos;26</p>
      <h1 className="ignite-title mb-3 text-4xl md:text-5xl">Rulebooks &amp; Programmes</h1>
      <p className="mb-10 max-w-2xl text-slate-400">Read the official guidelines and schedule for your event before you arrive.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {GUIDES.filter(hasDocument).map((g) => (
          <Link key={g.slug} href={guidePath(g.slug)} className="ignite-panel ignite-panel-hover ignite-hud-bracket group flex flex-col p-6">
            <BookOpen className="mb-4 h-7 w-7 text-orange-500" />
            <p className="font-hud text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{g.kicker}</p>
            <h2 className="mt-1 font-orbitron text-xl font-bold uppercase text-white">{g.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{g.tagline}</p>
            <span className="mt-6 flex items-center gap-1 font-hud text-sm font-bold uppercase tracking-widest text-slate-300 transition-colors group-hover:text-orange-400">
              {g.kicker.includes("Programme") ? "View programme" : "Read rulebook"} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
