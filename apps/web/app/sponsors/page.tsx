import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Handshake, Phone, Trophy, Users } from "lucide-react";
import { HACKATHON } from "../../lib/hackathon-rules";
import { PS_COUNT, PS_PAGE_PATH, PS_THEME_COUNT } from "../../lib/problem-statements";
import { SPONSORS, SPONSORSHIP_CONTACTS, SPONSOR_TIERS, type Sponsor } from "../../lib/sponsors";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "The sponsors and partners of IEEE IGNITE '26, and how to partner with the conclave and its 24-hour hackathon at SKIT Jaipur.",
};

// Only facts the site already states elsewhere (events, dates, the hackathon and its problem statements)
const REACH = [
  { icon: CalendarDays, value: "5 EVENTS", label: "4 days · 12-15 October 2026" },
  { icon: Trophy, value: HACKATHON.prizePool.toUpperCase(), label: "Hackathon prize pool" },
  { icon: FileText, value: `${PS_COUNT} PS`, label: `Problem statements across ${PS_THEME_COUNT} themes` },
  { icon: Users, value: "24 HRS", label: "Offline software & hardware hackathon" },
];

function SponsorCard({ sponsor, featured }: { sponsor: Sponsor; featured: boolean }) {
  const body = (
    <>
      {sponsor.logo ? (
        <div className={`relative w-full ${featured ? "h-28 sm:h-36" : "h-20"}`}>
          <Image src={sponsor.logo} alt={sponsor.name} fill sizes={featured ? "(max-width: 640px) 90vw, 480px" : "240px"} className="object-contain" />
        </div>
      ) : (
        <span className={`font-orbitron font-bold uppercase tracking-wider text-white ${featured ? "text-2xl" : "text-base"}`}>{sponsor.name}</span>
      )}
      {sponsor.url && <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-500 transition-colors group-hover:text-orange-400" aria-hidden="true" />}
    </>
  );
  const className = `ignite-panel ignite-hud-bracket group relative flex items-center justify-center p-6 text-center transition-colors ${featured ? "min-h-48" : "min-h-32"} ${sponsor.url ? "hover:border-orange-500/50" : ""}`;
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener" className={className} aria-label={`${sponsor.name} (opens their website)`}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function SponsorsPage() {
  const tiers = SPONSOR_TIERS.map((tier) => ({ tier, sponsors: SPONSORS.filter((s) => s.tier === tier.id) })).filter((t) => t.sponsors.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 text-white sm:px-8 sm:pt-12">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> IEEE IGNITE &apos;26</p>
        <h1 className="ignite-title text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
          Sponsors <span className="text-orange-500">&amp;</span> Partners
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
          The organisations powering IEEE IGNITE &apos;26, the flagship technical conclave and 24-hour hackathon of the IEEE Student Branch, SKIT Jaipur.
        </p>
      </section>

      {/* Sponsors by tier */}
      {tiers.length > 0 ? (
        <div className="mt-14 space-y-14">
          {tiers.map(({ tier, sponsors }) => {
            const featured = tier.id === "title";
            return (
              <section key={tier.id} aria-labelledby={`tier-${tier.id}`}>
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent" />
                  <h2 id={`tier-${tier.id}`} className="font-orbitron text-lg font-bold uppercase tracking-widest sm:text-xl">{tier.name}</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-orange-500/50 to-transparent" />
                </div>
                <div className={`grid gap-4 ${featured ? "mx-auto max-w-xl grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
                  {sponsors.map((s) => (
                    <SponsorCard key={s.name} sponsor={s} featured={featured} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="ignite-panel ignite-hud-bracket relative mt-12 overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/15 blur-[90px]" aria-hidden="true" />
          <Handshake className="relative mx-auto mb-4 h-12 w-12 text-orange-500 drop-shadow-[0_0_14px_rgba(249,115,22,0.6)]" />
          <h2 className="ignite-title relative text-2xl sm:text-3xl">Sponsors to be announced</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-400">
            Our sponsors and partners for IEEE IGNITE &apos;26 will be revealed here soon. Want your brand on this wall? Talk to the sponsorship team below.
          </p>
        </section>
      )}

      {/* Why partner */}
      <section className="mt-16" aria-labelledby="why-partner">
        <p className="ignite-eyebrow mb-2"><span className="text-orange-500/60">{"////"}</span> Partner with us</p>
        <h2 id="why-partner" className="ignite-title mb-6 text-2xl sm:text-3xl">Why IGNITE</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {REACH.map(({ icon: Icon, value, label }) => (
            <div key={value} className="ignite-panel ignite-panel-hover p-5">
              <Icon className="mb-3 h-6 w-6 text-orange-500" />
              <div className="font-orbitron text-xl font-bold text-white sm:text-2xl">{value}</div>
              <div className="mt-1 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          See the <Link href="/events" className="ignite-link">events</Link> and the hackathon&apos;s{" "}
          <Link href={PS_PAGE_PATH} className="ignite-link">problem statements</Link>.
        </p>
      </section>

      {/* Sponsorship team */}
      <section className="mt-16" aria-labelledby="sponsorship-team">
        <p className="ignite-eyebrow mb-2"><span className="text-orange-500/60">{"////"}</span> Get in touch</p>
        <h2 id="sponsorship-team" className="ignite-title mb-6 text-2xl sm:text-3xl">Sponsorship Team</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SPONSORSHIP_CONTACTS.map((c) => (
            <div key={c.name} className="ignite-panel ignite-hud-bracket flex items-center gap-4 p-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-orange-500/40">
                <Image src={c.photo} alt={c.name} fill sizes="64px" className="object-cover object-top" />
              </div>
              <div className="min-w-0">
                <p className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">{c.name}</p>
                <p className="font-hud text-[11px] font-bold uppercase tracking-[0.15em] text-orange-400">{c.role}</p>
                {c.phone && (
                  <a href={`tel:+91${c.phone}`} className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-orange-300">
                    <Phone className="h-3.5 w-3.5 text-orange-500" /> {c.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
