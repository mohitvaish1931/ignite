"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Calendar, ChevronRight, FileText, Lock, Trophy, Users } from "lucide-react";
import { HACKATHON, HACKATHON_REGISTER_URL, JUDGING_CRITERIA, MAX_TEAM_SIZE, MIN_TEAM_SIZE, MISSION_STEPS, RULEBOOK_PATH } from "../../lib/hackathon-rules";
import { PS_COUNT, PS_PAGE_PATH, PS_THEME_COUNT } from "../../lib/problem-statements";
import { CautionTape } from "./CautionTape";

type Hackathon = {
  slug: string;
  name: string;
  summary?: string | null;
  state: string;
  startAt: string | Date;
  endAt: string | Date;
  capacity: number | null;
};

type Phase = "closed" | "scanning" | "granted" | "open";

// Where the transparent doorway sits inside /hackathon-door.webp (percent of the image)
const OPENING = { left: 17, top: 4.5, width: 75, height: 82.5 };
const DOOR_EASE = [0.7, 0, 0.2, 1] as const;
// The hackathon runs at SKIT Jaipur, so dates read in India time wherever the visitor is
const EVENT_TZ = "Asia/Kolkata";

const shortDate = (d: string | Date) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: EVENT_TZ });

/** "14-15 OCT 2026", or "30 SEP - 1 OCT 2026" across months. */
function dateRange(start: string | Date, end: string | Date) {
  const part = (d: string | Date, o: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString("en-GB", { ...o, timeZone: EVENT_TZ });
  const year = part(end, { year: "numeric" });
  const sameMonth = part(start, { month: "short" }) === part(end, { month: "short" });
  const range = sameMonth
    ? `${part(start, { day: "numeric" })}-${part(end, { day: "numeric" })} ${part(end, { month: "short" })}`
    : `${part(start, { day: "numeric", month: "short" })} - ${part(end, { day: "numeric", month: "short" })}`;
  return `${range} ${year}`.toUpperCase();
}

function statusOf(h: Hackathon) {
  if (h.state === "LIVE") return { label: "LIVE", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" };
  if (h.state === "REGISTRATION_OPEN") return { label: "REG. OPEN", className: "border-orange-500/40 bg-orange-500/10 text-orange-300" };
  if (h.state === "REGISTRATION_CLOSED") return { label: "REG. CLOSED", className: "ignite-caution-tag" };
  return { label: "UPCOMING", className: "border-white/15 bg-white/5 text-slate-300" };
}

/** One half of the airlock: plated metal, a lit inner edge, hazard band and half of the IGNITE logo. */
function DoorPanel({ side, phase }: { side: "left" | "right"; phase: Phase }) {
  const isLeft = side === "left";
  const lit = phase === "granted" ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-orange-500 shadow-[0_0_10px_#f97316]";

  return (
    <motion.div
      className={`absolute inset-y-0 w-1/2 overflow-hidden ${isLeft ? "left-0" : "right-0"}`}
      initial={false}
      animate={{ x: phase === "open" ? (isLeft ? "-101%" : "101%") : "0%" }}
      transition={{ duration: 1.15, ease: DOOR_EASE }}
      style={{
        background: isLeft
          ? "linear-gradient(90deg, #0a0b0f 0%, #171a21 55%, #20242c 100%)"
          : "linear-gradient(270deg, #0a0b0f 0%, #171a21 55%, #20242c 100%)",
      }}
    >
      {/* Horizontal armour plates */}
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 11%, rgba(255,255,255,0.05) 11% 11.4%, rgba(0,0,0,0.5) 11.4% 11.8%)" }}
      />
      {/* Recessed vertical channel */}
      <div className={`absolute inset-y-[8%] w-[10%] rounded-sm border border-white/5 bg-black/30 ${isLeft ? "left-[14%]" : "right-[14%]"}`} />
      {/* Hazard band */}
      <div
        className="absolute inset-x-0 top-[70%] h-[3.5%] opacity-60"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #f97316 0 10px, transparent 10px 20px)" }}
      />
      {/* Status lights */}
      <div className={`absolute top-[18%] flex flex-col gap-2 ${isLeft ? "right-[10%]" : "left-[10%]"}`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${lit}`} />
        ))}
      </div>
      {/* Half of the logo, split exactly at the seam */}
      <div className={`absolute top-[36%] w-[120%] ${isLeft ? "-right-[60%]" : "-left-[60%]"}`}>
        <Image src="/ignite-logo.png" alt="" width={1235} height={839} sizes="(max-width: 640px) 70vw, 520px" className="h-auto w-full opacity-80" />
      </div>
      {/* Lit inner edge at the seam */}
      <div className={`absolute inset-y-0 w-[3px] ${isLeft ? "right-0" : "left-0"} bg-gradient-to-b from-orange-500/0 via-orange-400 to-orange-500/0 shadow-[0_0_14px_rgba(249,115,22,0.9)]`} />
    </motion.div>
  );
}

// "Now" only exists in the browser: the server (and the first browser render) get null and show
// placeholders, then the clock ticks once a second. Keeps prerendered HTML and hydration in step.
const subscribeToClock = (tick: () => void) => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
function useNow() {
  return useSyncExternalStore(subscribeToClock, currentSecond, () => null);
}

function Countdown({ startAt, endAt }: { startAt: string | Date; endAt: string | Date }) {
  const now = useNow();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const live = now !== null && now >= start && now < end;
  const over = now !== null && now >= end;
  const diff = now === null ? null : Math.max((live ? end : start) - now, 0);
  const units = [
    { label: "Days", value: diff === null ? null : Math.floor(diff / 86_400_000) },
    { label: "Hrs", value: diff === null ? null : Math.floor(diff / 3_600_000) % 24 },
    { label: "Min", value: diff === null ? null : Math.floor(diff / 60_000) % 60 },
    { label: "Sec", value: diff === null ? null : Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div role="timer">
      <p className={`mb-2 font-hud text-[11px] font-bold uppercase tracking-[0.25em] ${live ? "text-emerald-400" : "text-orange-400"}`}>
        {over ? "Mission complete" : live ? "Live now · ends in" : "Doors open in"}
      </p>
      {!over && (
        <div className="grid grid-cols-4 gap-2">
          {units.map((u) => (
            <div key={u.label} className="rounded-sm border border-white/10 bg-black/50 px-1 py-2 text-center">
              <div className="font-orbitron text-xl font-bold tabular-nums text-white sm:text-2xl">{u.value === null ? "--" : String(u.value).padStart(2, "0")}</div>
              <div className="font-hud text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{u.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The rulebook's headline facts. `door` sizes everything off the doorway width so it scales with the door. */
function BriefFacts({ hackathon, door }: { hackathon: Hackathon; door?: boolean }) {
  const facts = [
    { label: "Dates", value: dateRange(hackathon.startAt, hackathon.endAt) },
    { label: "Venue", value: HACKATHON.venue },
    { label: "Mode", value: HACKATHON.mode },
    { label: "Fee", value: "₹500 / team" },
    { label: "Team size", value: `${MIN_TEAM_SIZE}-${MAX_TEAM_SIZE} members` },
    { label: "Open to", value: "UG · PG · Diploma · PhD" },
  ];
  return (
    <dl className={door ? "grid w-full grid-cols-3 gap-[1.6cqw]" : "grid grid-cols-2 gap-2"}>
      {facts.map((f) => (
        <div
          key={f.label}
          className={`rounded-sm border border-white/10 text-left ${door ? "bg-black/55 px-[2cqw] py-[1.6cqw] backdrop-blur-sm" : "bg-white/[0.04] p-3"}`}
        >
          <dt className={`font-hud font-bold uppercase text-orange-400 ${door ? "text-[max(8px,1.65cqw)] tracking-[0.2em]" : "text-[10px] tracking-[0.2em]"}`}>{f.label}</dt>
          <dd className={`font-orbitron font-bold uppercase leading-tight text-white ${door ? "mt-[0.4cqw] text-[max(9px,2.15cqw)]" : "mt-0.5 text-xs"}`}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The prize pool, in gold so it stands apart from the orange HUD. */
function PrizePool({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-sm border border-amber-400/40 bg-gradient-to-r from-amber-400/[0.14] to-amber-400/[0.03] p-3 ${className}`}>
      <Trophy className="h-7 w-7 shrink-0 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
      <div>
        <div className="font-orbitron text-xl font-black uppercase text-amber-200">{HACKATHON.prizePool}</div>
        <div className="font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/80">Total prize pool</div>
      </div>
    </div>
  );
}

/** Pulsing green "live" light, sized to the text around it. */
function LiveDot() {
  return (
    <span className="relative flex h-[0.6em] w-[0.6em] shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-full w-full rounded-full bg-emerald-400" />
    </span>
  );
}

function BriefActions({ door, closed }: { door?: boolean; closed?: boolean }) {
  const size = door ? "px-[3cqw] py-[1.8cqw] text-[max(9px,1.9cqw)] tracking-wider" : "whitespace-nowrap px-2 py-3 text-[11px] tracking-wide";
  return (
    <div className={`flex w-full flex-wrap justify-center ${door ? "gap-[1.6cqw]" : "gap-2"}`}>
      {closed ? (
        // Sign-ups are over, so the problem statements take the lead
        <>
          <span className={`ignite-caution-tag flex items-center gap-1.5 rounded-sm font-orbitron ${size} ${door ? "" : "w-full justify-center"}`}>
            <Lock className="h-[1.1em] w-[1.1em]" /> REGISTRATION CLOSED
          </span>
          <Link href={PS_PAGE_PATH} className={`ignite-btn-primary group flex items-center gap-1.5 rounded-sm font-orbitron font-bold text-black ${size} ${door ? "" : "w-full justify-center"}`}>
            <FileText className="h-[1.2em] w-[1.2em]" /> PROBLEM STATEMENTS
            <ChevronRight className="h-[1.2em] w-[1.2em] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </>
      ) : (
        <>
          {/* For now registration runs on the SKIT ERP, without logging in here */}
          <a href={HACKATHON_REGISTER_URL} className={`ignite-btn-primary group flex items-center gap-1 rounded-sm font-orbitron font-bold text-black ${size} ${door ? "" : "w-full justify-center"}`}>
            REGISTER NOW
            <ChevronRight className="h-[1.2em] w-[1.2em] transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link href={PS_PAGE_PATH} className={`ignite-btn-secondary flex items-center gap-1.5 rounded-sm border-emerald-400/40 font-orbitron font-bold text-neutral-100 ${size} ${door ? "" : "w-full justify-center"}`}>
            <LiveDot /> PROBLEM STATEMENTS
          </Link>
        </>
      )}
      <Link href={RULEBOOK_PATH} className={`ignite-btn-secondary flex items-center gap-1.5 rounded-sm font-orbitron font-bold text-neutral-200 ${size} ${door ? "" : "w-full justify-center"}`}>
        <BookOpen className="h-[1.2em] w-[1.2em]" /> RULEBOOK
      </Link>
      {/* Team formation on this site is paused while registration runs on the ERP
      <Link href="/teams" className={`ignite-btn-secondary flex items-center gap-1.5 rounded-sm font-orbitron font-bold text-neutral-200 ${size} ${door ? "" : "flex-1 justify-center"}`}>
        <Users className="h-[1.2em] w-[1.2em]" /> FORM A SQUAD
      </Link>
      */}
    </div>
  );
}

/** What waits behind the door when there is one hackathon: its mission brief. */
function MissionBrief({ hackathon }: { hackathon: Hackathon }) {
  // Days to launch; null on the server and first browser render (see useNow)
  const now = useNow();
  const status = statusOf(hackathon);
  const days = now === null ? 0 : Math.ceil((new Date(hackathon.startAt).getTime() - now) / 86_400_000);
  const closed = hackathon.state === "REGISTRATION_CLOSED";

  return (
    <>
      <p className="font-hud text-[max(8px,1.75cqw)] font-bold uppercase tracking-[0.35em] text-orange-400">Airlock 06 // Access granted</p>
      <p className="mt-[2.4cqw] font-orbitron text-[max(9px,2.4cqw)] font-bold tracking-[0.45em] text-slate-300">IEEE IGNITE</p>
      <h3 className="ignite-title text-[max(17px,6.6cqw)] leading-none drop-shadow-[0_0_24px_rgba(249,115,22,0.35)]">
        Hackathon <span className="text-orange-500">2026</span>
      </h3>
      <p className="mt-[1.6cqw] font-hud text-[max(9px,2.3cqw)] font-semibold uppercase tracking-[0.2em] text-slate-300">{HACKATHON.tagline}</p>

      <div className="mt-[2.6cqw] flex flex-wrap items-center justify-center gap-[1.6cqw] font-hud text-[max(8px,1.75cqw)] font-bold uppercase tracking-[0.2em]">
        <span className={`rounded-sm border px-[1.4cqw] py-[0.5cqw] ${status.className}`}>{status.label}</span>
        <span className="flex items-center gap-[0.6cqw] rounded-sm border border-amber-400/50 bg-amber-400/10 px-[1.4cqw] py-[0.5cqw] text-amber-300">
          <Trophy className="h-[1.1em] w-[1.1em]" /> {HACKATHON.prizePool} prize pool
        </span>
        {days > 0 && <span className="text-slate-300">T-{days} day{days === 1 ? "" : "s"} to launch</span>}
      </div>

      {/* Phones: the doorway is too small, so the brief rolls out below the door */}
      <div className="mt-[4cqw] hidden w-full flex-1 flex-col gap-[3cqw] sm:flex">
        <BriefFacts hackathon={hackathon} door />
        <p className="text-[max(9px,1.9cqw)] text-slate-400">
          {closed
            ? "Registrations are now closed. Every registered member is verified in person at SKIT."
            : "Seats are limited and allotted first-come, first-served. Every member is verified in person."}
        </p>
        <div>
          <p className="font-hud text-[max(8px,1.65cqw)] font-bold uppercase tracking-[0.3em] text-slate-500">Judged on</p>
          <ul className="mt-[1.2cqw] flex flex-wrap justify-center gap-[1cqw]">
            {JUDGING_CRITERIA.map((c) => (
              <li key={c.title} title={c.text} className="rounded-sm border border-orange-500/25 bg-orange-500/[0.06] px-[1.4cqw] py-[0.6cqw] font-hud text-[max(8px,1.7cqw)] font-bold uppercase tracking-[0.12em] text-orange-200">
                {c.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto">
          <BriefActions door closed={closed} />
        </div>
      </div>
      <p className="mt-[5cqw] font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400 sm:hidden">Mission brief below</p>
    </>
  );
}

/** Several hackathons at once: a list to pick from. */
function ArenaList({ hackathons }: { hackathons: Hackathon[] }) {
  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3">
        {hackathons.map((h, i) => {
          const status = statusOf(h);
          return (
            <motion.div key={h.slug} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75 + i * 0.12 }}>
              <Link
                href={`/events/${h.slug}`}
                className="ignite-hud-bracket group flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-black/50 p-3.5 text-left backdrop-blur-sm transition-colors hover:border-orange-500/60 hover:bg-orange-500/10 sm:p-4"
              >
                <div className="min-w-0">
                  <span className={`mb-1 inline-block rounded-sm border px-1.5 py-0.5 font-hud text-[9px] font-bold tracking-widest sm:text-[10px] ${status.className}`}>{status.label}</span>
                  <p className="truncate font-orbitron text-sm font-bold uppercase text-white sm:text-base">{h.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 font-hud text-[11px] font-semibold tracking-widest text-slate-400 sm:text-xs">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-orange-500" />{shortDate(h.startAt)} - {shortDate(h.endAt)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3 text-orange-500" />{h.capacity ? `${h.capacity} seats` : "Open"}</span>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-orbitron text-[11px] font-bold tracking-widest text-orange-400 transition-colors group-hover:text-white sm:text-xs">
                  ENTER <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-auto flex flex-wrap justify-center gap-2 pt-4 sm:gap-3 sm:pt-6">
        {/* Team formation on this site is switched off with accounts (see _backend/README.md)
        <Link href="/teams" className="ignite-btn-primary rounded-sm px-5 py-2.5 font-orbitron text-[11px] font-bold tracking-wider text-black sm:text-xs">FORM A SQUAD</Link>
        */}
        <Link href={PS_PAGE_PATH} className="ignite-btn-secondary flex items-center gap-1.5 rounded-sm px-5 py-2.5 font-orbitron text-[11px] font-bold tracking-wider text-neutral-100 sm:text-xs"><LiveDot /> PROBLEM STATEMENTS</Link>
        <Link href={RULEBOOK_PATH} className="ignite-btn-secondary rounded-sm px-5 py-2.5 font-orbitron text-[11px] font-bold tracking-wider text-neutral-200 sm:text-xs">RULEBOOK</Link>
      </div>
    </>
  );
}

/** Countdown and headline numbers for the featured hackathon. */
function MissionControl({ hackathon }: { hackathon: Hackathon }) {
  const stats = [
    { label: "Fee / team", value: "₹500" },
    { label: "Team size", value: `${MIN_TEAM_SIZE}-${MAX_TEAM_SIZE}` },
    { label: "Hours", value: "24" },
    { label: "Mode", value: "Offline" },
  ];
  return (
    <div className="ignite-panel ignite-hud-bracket p-6">
      <p className="ignite-eyebrow mb-1"><span className="text-orange-500/60">{"////"}</span> Launch sequence</p>
      <h3 className="ignite-title mb-5 text-xl">Mission Control</h3>
      <Countdown startAt={hackathon.startAt} endAt={hackathon.endAt} />
      <PrizePool className="mt-4" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-white/10 bg-white/[0.03] p-3">
            <div className="font-orbitron text-xl font-bold text-white">{s.value}</div>
            <div className="font-hud text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
      {hackathon.state === "REGISTRATION_CLOSED" ? (
        <div className="-mx-6 mt-4 overflow-hidden py-2">
          <p className="sr-only">Registrations closed</p>
          <CautionTape size="sm" tilt={-2} className="-mx-3" text="REGISTRATIONS CLOSED" />
        </div>
      ) : (
        <a href={HACKATHON_REGISTER_URL} className="group mt-4 block rounded-sm border border-orange-500/30 bg-orange-500/[0.07] p-3 transition-colors hover:bg-orange-500/15">
          <p className="font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">Seats are limited · first come, first served</p>
          <p className="flex items-center gap-1 font-orbitron text-sm font-bold uppercase text-white group-hover:text-orange-200">
            Secure your spot <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </p>
        </a>
      )}
      <Link
        href={PS_PAGE_PATH}
        className="group mt-3 block rounded-sm border border-emerald-400/50 bg-emerald-400/[0.1] p-4 shadow-[0_0_24px_rgba(52,211,153,0.15)] transition-colors hover:bg-emerald-400/20"
      >
        <p className="flex items-center gap-2 font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
          <LiveDot /> Problem statements are live
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-orbitron text-base font-bold uppercase text-white group-hover:text-emerald-100">
          <FileText className="h-4 w-4" /> {PS_COUNT} PS · {PS_THEME_COUNT} themes <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
    </div>
  );
}

/** How the hackathon runs, from the rulebook. */
function MissionProtocol() {
  return (
    <div className="ignite-panel ignite-hud-bracket p-6">
      <p className="ignite-eyebrow mb-1"><span className="text-orange-500/60">{"////"}</span> Mission protocol</p>
      <h3 className="ignite-title mb-5 text-xl">How It Works</h3>
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-gradient-to-b before:from-orange-500/60 before:to-transparent">
        {MISSION_STEPS.map((p) => (
          <li key={p.step} className="relative flex gap-4">
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/50 bg-[#07080d] font-hud text-xs font-bold text-orange-400">
              {p.step}
            </span>
            <div>
              <p className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">{p.title}</p>
              <p className="text-sm text-slate-400">{p.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href={RULEBOOK_PATH} className="ignite-link mt-5 inline-flex items-center gap-1.5">
        <BookOpen className="h-4 w-4" /> Read the full rulebook
      </Link>
    </div>
  );
}

/**
 * Hackathon entry: a sci-fi airlock (door frame from "hackathon door") that scans,
 * grants access and slides open to reveal the hackathon inside the doorway.
 */
export default function HackathonAirlock({ hackathons }: { hackathons: Hackathon[] }) {
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "open" : "closed"
  );

  useEffect(() => {
    if (phase === "open") return;
    const timers = [
      setTimeout(() => setPhase("scanning"), 250),
      setTimeout(() => setPhase("granted"), 1500),
      setTimeout(() => setPhase("open"), 2150),
    ];
    return () => timers.forEach(clearTimeout);
    // Run the entry sequence once per mount (each time the Hackathons tab is entered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = phase === "open";
  // Events arrive sorted by start date: the nearest one is the featured mission
  const featured = hackathons[0];
  const single = hackathons.length === 1;

  const sidePanel = (side: "left" | "right") => ({
    initial: false as const,
    animate: open ? { opacity: 1, x: 0 } : { opacity: 0, x: side === "left" ? -40 : 40 },
    transition: { delay: open ? 0.8 : 0, duration: 0.6, ease: "easeOut" as const },
  });

  return (
    <section className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden py-6 [--door-w:min(860px,calc((100svh-7rem)*0.9244))] sm:py-10">
      {/* The corridor continues across the whole screen: a blurred, dimmed copy of the door frame */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Image src="/hackathon-door.webp" alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030408] via-transparent to-[#030408]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030408] via-transparent to-[#030408]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(249,115,22,0.18),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 100%" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1800px] grid-cols-1 items-center gap-8 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_var(--door-w)_minmax(0,1fr)]">
        {featured && (
          <motion.div className="hidden justify-self-end xl:block xl:w-full xl:max-w-sm" {...sidePanel("left")}>
            <MissionControl hackathon={featured} />
          </motion.div>
        )}

        {/* The door is sized to the screen height so it always fits in view */}
        <div className="mx-auto w-[min(100%,var(--door-w))] min-w-0 xl:col-start-2 xl:w-full">
          <div className="relative w-full select-none" style={{ aspectRatio: "1100 / 1190" }}>
            {/* Doorway: interior, doors and HUD all live inside the transparent opening */}
            <div
              className="@container absolute overflow-hidden"
              style={{ left: `${OPENING.left}%`, top: `${OPENING.top}%`, width: `${OPENING.width}%`, height: `${OPENING.height}%` }}
            >
              {/* Interior: the hackathon arena */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#1b0f05_0%,#07080d_55%,#030408_100%)]">
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                />
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 flex flex-col items-center overflow-y-auto px-[6%] pb-[6%] pt-[14%] text-center select-text [scrollbar-width:none]"
                    >
                      {single ? (
                        <MissionBrief hackathon={featured} />
                      ) : (
                        <>
                          <p className="mb-1 font-hud text-[9px] font-bold uppercase tracking-[0.35em] text-orange-400 sm:text-xs"><span className="hidden sm:inline">Airlock 06 // </span>Access granted</p>
                          <h3 className="ignite-title mb-1 text-sm sm:text-2xl md:text-[1.7rem]">Hackathon <span className="text-orange-500">Arena</span></h3>
                          {hackathons.length === 0 ? (
                            <p className="mt-6 text-xs text-slate-400 sm:text-sm">No hackathons are open right now. Check back soon!</p>
                          ) : (
                            <>
                              <p className="mb-4 text-[10px] text-slate-400 sm:mb-6 sm:text-sm">Pick your battleground. Form a squad. Build the future.</p>
                              <div className="hidden w-full flex-1 flex-col sm:flex">
                                <ArenaList hackathons={hackathons} />
                              </div>
                              <p className="mt-2 font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400 sm:hidden">Choose your hackathon below</p>
                            </>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Light burst from the seam as the doors part */}
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-1/2 w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,200,140,0.55)_0%,rgba(249,115,22,0.25)_30%,transparent_65%)]"
                initial={false}
                animate={open ? { opacity: [0, 1, 0], scaleX: [0.05, 1, 1.2] } : { opacity: 0, scaleX: 0.05 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* The two door halves */}
              <div className={`absolute inset-0 ${open ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => setPhase("open")} title={open ? undefined : "Skip"}>
                <DoorPanel side="left" phase={phase} />
                <DoorPanel side="right" phase={phase} />

                {/* Seam glow: pulses while scanning, flashes on access */}
                {!open && (
                  <motion.div
                    className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2"
                    animate={
                      phase === "granted"
                        ? { opacity: 1, boxShadow: "0 0 30px 8px rgba(52,211,153,0.8)", backgroundColor: "#d1fae5" }
                        : { opacity: [0.5, 1, 0.5], boxShadow: "0 0 18px 4px rgba(249,115,22,0.7)", backgroundColor: "#fdba74" }
                    }
                    transition={phase === "granted" ? { duration: 0.25 } : { duration: 1.4, repeat: Infinity }}
                  />
                )}

                {/* Scanner sweep */}
                {phase === "scanning" && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 h-[2px] bg-orange-400 shadow-[0_0_16px_4px_rgba(249,115,22,0.7)]"
                    initial={{ top: "0%" }}
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                )}

                {/* Airlock HUD */}
                <AnimatePresence>
                  {!open && (
                    <motion.div exit={{ opacity: 0, y: -8 }} className="pointer-events-none absolute inset-x-0 top-[11%] flex justify-center">
                      <div className="rounded-sm border border-white/10 bg-black/70 px-3 py-1.5 text-center backdrop-blur-sm sm:px-5 sm:py-2.5">
                        <p className="font-hud text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400 sm:text-[11px]">
                          {single ? "IEEE IGNITE Hackathon 2026" : "Hackathon Arena"}{" // Airlock 06"}
                        </p>
                        <p className={`font-pixel text-[7px] tracking-widest sm:text-[10px] ${phase === "granted" ? "text-emerald-400" : "text-orange-400"}`}>
                          {phase === "granted" ? "ACCESS GRANTED" : phase === "scanning" ? "SCANNING..." : "SEALED"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Door frame on top: its doorway is transparent, so the doors slide into the walls */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={false}
              animate={{ filter: open || phase === "granted" ? "brightness(1.05)" : "brightness(0.75)" }}
              transition={{ duration: 0.6 }}
            >
              <Image src="/hackathon-door.webp" alt="" fill priority sizes="(max-width: 900px) 100vw, 860px" className="object-cover" />
            </motion.div>

            {/* Floor glow spilling out of the doorway once open */}
            <motion.div
              className="pointer-events-none absolute bottom-[2%] left-[20%] right-[12%] h-[12%] rounded-full bg-orange-500/30 blur-3xl"
              initial={false}
              animate={{ opacity: open ? 1 : 0.2 }}
              transition={{ duration: 1 }}
            />
          </div>

          {/* Phones: the doorway is too small for the brief or the list, so it rolls out below the door */}
          {open && featured && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="-mt-2 flex flex-col gap-4 sm:hidden">
              {single ? (
                <div className="ignite-panel ignite-hud-bracket flex flex-col gap-4 p-4">
                  <PrizePool />
                  <p className="text-sm text-slate-300">{featured.summary || HACKATHON.tagline}</p>
                  <BriefFacts hackathon={featured} />
                  <BriefActions closed={featured.state === "REGISTRATION_CLOSED"} />
                </div>
              ) : (
                <ArenaList hackathons={hackathons} />
              )}
            </motion.div>
          )}
        </div>

        <motion.div className="hidden justify-self-start xl:block xl:w-full xl:max-w-sm" {...sidePanel("right")}>
          <MissionProtocol />
        </motion.div>
      </div>

      {/* Narrower screens: the same panels sit under the door */}
      <motion.div
        className="relative mx-auto mt-8 grid max-w-[860px] gap-6 px-4 sm:grid-cols-2 sm:px-8 xl:hidden"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 20 }}
        transition={{ delay: open ? 0.8 : 0, duration: 0.6 }}
      >
        {featured && <MissionControl hackathon={featured} />}
        <MissionProtocol />
      </motion.div>
    </section>
  );
}
