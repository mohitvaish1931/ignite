"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ChevronRight, Clock, Code, Flame, IndianRupee, MapPin, ShieldAlert, Terminal, Trophy, Users } from "lucide-react";
import { getPublicEvents } from "../actions/events";
import { HACKATHON, HACKATHON_REGISTER_URL, JUDGING_CRITERIA, MAX_TEAM_SIZE, MIN_TEAM_SIZE, RULEBOOK_PATH } from "../../lib/hackathon-rules";

function durationLabel(start: Date, end: Date) {
  const hours = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3_600_000));
  return hours < 48 ? `${hours} HOURS` : `${Math.round(hours / 24)} DAYS`;
}

// The hackathon runs at SKIT Jaipur, so dates read in India time
const shortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" });

function dateRange(start: Date, end: Date) {
  const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Asia/Kolkata" });
  const monthYear = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  return monthYear(start) === monthYear(end) ? `${day(start)}-${day(end)} ${monthYear(end)}` : `${shortDate(start)} - ${shortDate(end)}`;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents({ hackathonsOnly: true })
      .then((res) => { if (res.success && res.data) setHackathons(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="ignite-spinner" />
      </div>
    );
  }

  // Events arrive sorted by start date: feature the nearest one
  const [hackathon, ...others] = hackathons;

  if (!hackathon) {
    return (
      <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden text-white">
        <div className="relative z-10 flex max-w-2xl flex-col items-center px-4 text-center">
          <ShieldAlert className="mb-6 h-24 w-24 animate-pulse text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
          <h1 className="ignite-title mb-4 text-4xl md:text-6xl">
            No Active <span className="text-orange-500">Hackathons</span>
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Our systems indicate no hackathons are currently scheduled. The grid is quiet for now. Check back later for upcoming transmissions.
          </p>
          <Link href="/events" className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-widest text-black">
            BROWSE ALL EVENTS
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(hackathon.startAt);
  const endDate = new Date(hackathon.endAt);
  const meta = (hackathon.settings?.metadata ?? {}) as Record<string, string | undefined>;

  return (
    <div className="overflow-hidden text-white">
      {/* HERO */}
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center px-4 pb-12 pt-8 sm:px-8">
        {hackathon.imageUrl && (
          <div className="absolute inset-0 -z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hackathon.imageUrl} alt="" className="h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/40 via-[#030408]/80 to-[#030408]" />
          </div>
        )}

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="font-hud text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                {hackathon.state === "LIVE" ? "Live now" : hackathon.state === "REGISTRATION_OPEN" ? "Registration open" : "Coming soon"}
              </span>
            </div>

            <h1 className="font-orbitron text-4xl font-bold uppercase leading-[1.1] tracking-tight md:text-6xl">{hackathon.name}</h1>

            <p className="max-w-xl text-lg text-slate-300 md:text-xl">
              {hackathon.summary || "Build the future. Challenge the impossible. Join the ultimate hackathon experience at IEEE IGNITE '26."}
            </p>

            <div className="mt-2 flex flex-wrap gap-6">
              {[
                { icon: Calendar, label: "Dates", value: dateRange(startDate, endDate) },
                { icon: Clock, label: "Duration", value: durationLabel(startDate, endDate) },
                { icon: MapPin, label: "Venue", value: HACKATHON.venue },
                { icon: Users, label: "Team", value: `${MIN_TEAM_SIZE}-${MAX_TEAM_SIZE} members` },
                { icon: IndianRupee, label: "Fee", value: HACKATHON.fee },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-orange-500" />
                  <div className="flex flex-col">
                    <span className="font-hud text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
                    <span className="text-sm font-bold uppercase">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              {/* For now registration runs on the SKIT ERP, without logging in here */}
              <a
                href={HACKATHON_REGISTER_URL}
                className="ignite-btn-primary group flex items-center justify-center gap-2 rounded-sm px-8 py-4 font-orbitron font-bold uppercase tracking-widest text-black"
              >
                Enter the Grid
                <Terminal className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href={RULEBOOK_PATH} className="ignite-btn-secondary flex items-center justify-center gap-2 rounded-sm px-8 py-4 font-orbitron font-bold uppercase tracking-widest text-neutral-200">
                <BookOpen className="h-5 w-5" /> Rulebook
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              {HACKATHON.mode} · {HACKATHON.openTo}.
              {/* Team formation on this site is paused while registration runs on the ERP
              {" "}<Link href="/teams" className="font-semibold text-orange-400 hover:underline">Form a squad</Link>
              */}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden items-center justify-center lg:flex"
          >
            <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-[100px]" />
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="h-64 w-64 rotate-45 animate-[spin_20s_linear_infinite] border border-orange-500/30" />
              <div className="absolute h-64 w-64 rotate-12 animate-[spin_30s_linear_infinite_reverse] border border-amber-400/20" />
            </div>
            <Image src="/robot.webp" alt="" width={685} height={900} priority className="relative z-10 h-auto w-full max-w-sm drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]" />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 border-y border-white/5 bg-black/40 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-8 md:grid-cols-4">
          {[
            { icon: Trophy, value: meta.prizePool || "TBA", label: "PRIZE POOL" },
            // Registrations happen on the ERP, so this site has no hacker count to show; the fee is fixed
            { icon: IndianRupee, value: "₹500", label: "PER TEAM" },
            { icon: Code, value: meta.codingHours || durationLabel(startDate, endDate).split(" ")[0], label: "HOURS OF CODING" },
            { icon: Flame, value: `${MIN_TEAM_SIZE}-${MAX_TEAM_SIZE}`, label: "TEAM SIZE" },
          ].map((stat) => (
            <div key={stat.label} className="ignite-panel ignite-panel-hover ignite-hud-bracket flex flex-col items-center p-6 text-center">
              <stat.icon className="mb-4 h-8 w-8 text-orange-500" />
              <h3 className="mb-1 font-orbitron text-2xl font-bold text-white md:text-3xl">{stat.value}</h3>
              <p className="font-hud text-xs font-bold tracking-[0.2em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative z-10 px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="ignite-title mb-6 text-3xl md:text-4xl">
            About <span className="text-orange-500">the Hackathon</span>
          </h2>
          <div className="mx-auto mb-8 h-1 w-24 bg-gradient-to-r from-orange-600 to-transparent" />
          <p className="whitespace-pre-line text-lg leading-relaxed text-slate-300">
            {hackathon.description ||
              "Gear up for non-stop innovation. Whether you are a master coder or a creative visionary, this is your arena. Form a squad, choose a track, and build solutions that push the boundaries of technology. Bring your setup and your A-game."}
          </p>

          {meta.innerImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mt-12 overflow-hidden rounded-sm border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.2)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meta.innerImageUrl} alt="" className="h-auto max-h-[500px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030408] via-transparent to-transparent" />
            </motion.div>
          )}
        </div>
      </section>

      {/* JUDGING */}
      <section className="relative z-10 px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> Rulebook §9</p>
          <h2 className="ignite-title mb-2 text-3xl">How You&apos;re Judged</h2>
          <p className="mb-8 max-w-2xl text-slate-400">Six criteria. Any team member may be asked to explain the code and technical decisions, and the panel&apos;s decision is final.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JUDGING_CRITERIA.map((c, i) => (
              <div key={c.title} className="ignite-panel ignite-panel-hover ignite-hud-bracket p-6">
                <p className="font-orbitron text-xs font-bold tracking-[0.3em] text-orange-500">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-orbitron text-lg font-bold uppercase text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{c.text}</p>
              </div>
            ))}
          </div>
          <Link href={RULEBOOK_PATH} className="ignite-link mt-8 inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Read the full rulebook
          </Link>
        </div>
      </section>

      {/* MORE HACKATHONS */}
      {others.length > 0 && (
        <section className="relative z-10 px-4 pb-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> Also on the grid</p>
            <h2 className="ignite-title mb-8 text-3xl">More Hackathons</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((h) => (
                <Link key={h.id} href={`/events/${h.id}`} className="ignite-panel ignite-panel-hover ignite-hud-bracket group p-6">
                  <p className="mb-2 font-hud text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                    {shortDate(h.startAt)} · {durationLabel(new Date(h.startAt), new Date(h.endAt))}
                  </p>
                  <h3 className="mb-4 font-orbitron text-xl font-bold uppercase text-white">{h.name}</h3>
                  <span className="flex items-center gap-1 font-hud text-sm font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-orange-400">
                    View details <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative z-10 overflow-hidden px-4 py-24 sm:px-8">
        <div className="absolute inset-0 -z-10 scale-110 skew-y-3 border-y border-orange-500/20 bg-orange-600/10" />
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Flame className="mb-6 h-16 w-16 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,1)]" />
          <h2 className="ignite-title mb-6 text-3xl md:text-5xl">Are You Ready to Hack?</h2>
          <p className="mb-10 max-w-xl text-lg text-slate-300">
            Seats are limited and allotted first-come, first-served. Assemble your squad of up to {MAX_TEAM_SIZE} and lock in your spot.
          </p>
          <a
            href={HACKATHON_REGISTER_URL}
            className="rounded-sm bg-white px-10 py-5 font-orbitron text-xl font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:bg-orange-500 hover:text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
          >
            Register Now
          </a>
        </div>
      </section>
    </div>
  );
}
