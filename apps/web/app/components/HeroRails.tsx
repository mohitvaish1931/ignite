"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { EVENTS, REGISTRATIONS_OPEN } from "../../lib/events";
import { getGuide } from "../../lib/guides";
import { HACKATHON, isHackathonEvent } from "../../lib/hackathon-rules";
import { PS_PAGE_PATH } from "../../lib/problem-statements";

// Side HUD panels for wide screens: they fill the space either side of the poster art with the
// event lineup (left) and a launch countdown (right). Shown from 1280px wide and 680px tall
// (see .ignite-hero-rail in globals.css); smaller screens keep the uncluttered hero.

const TZ = "Asia/Kolkata";
// The fest opens with Symposium Day 1 and closes when the hackathon ends
const OPENS_AT = Date.parse("2026-10-12T11:00:00+05:30");
const CLOSES_AT = Math.max(...EVENTS.map((e) => Date.parse(e.endAt)));

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", timeZone: TZ });
const month = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", timeZone: TZ }).toUpperCase();
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });

// Earliest first; on a shared start the hackathon leads the talk that runs during it
const LINEUP = [...EVENTS]
  .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || Number(isHackathonEvent(b)) - Number(isHackathonEvent(a)))
  .map((e) => {
    const guide = getGuide(e.slug);
    const sameDay = day(e.startAt) === day(e.endAt);
    return {
      slug: e.slug,
      label: e.name.replace(/^IEEE IGNITE\s+/i, "").replace(/\s+2026$/, ""),
      date: `${day(e.startAt)}${sameDay ? "" : `-${day(e.endAt)}`} ${month(e.endAt)}`,
      when: guide?.when?.time ?? time(e.startAt),
      href: isHackathonEvent(e) ? "/events?tab=hackathons" : `/events/${e.slug}`,
    };
  });

// "Now" exists only in the browser: null on the server and first render, then ticks each second
const subscribeToClock = (tick: () => void) => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
function useNow() {
  return useSyncExternalStore(subscribeToClock, currentSecond, () => null);
}

/** Thin altitude-style scale running down the outer edge of each rail. */
function Ruler({ side }: { side: "left" | "right" }) {
  return (
    <div className={`absolute inset-y-6 w-3 ${side === "left" ? "-left-6" : "-right-6"}`} aria-hidden="true">
      <div
        className="h-full w-full opacity-60"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, rgba(249,115,22,0.55) 0 1px, transparent 1px 12px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0 1px, transparent 1px 4px)",
          backgroundSize: side === "left" ? "100% 100%, 50% 100%" : "100% 100%, 50% 100%",
          backgroundPosition: side === "left" ? "left top, left top" : "right top, right top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className={`absolute top-1/2 h-px w-5 -translate-y-1/2 bg-orange-400 shadow-[0_0_8px_#f97316] ${side === "left" ? "left-0" : "right-0"}`} />
    </div>
  );
}

function MissionLineup() {
  return (
    <nav aria-label="Event lineup" className="relative">
      <Ruler side="left" />
      <p className="mb-1 flex items-center gap-2 font-hud text-[10px] font-bold uppercase tracking-[0.35em] text-orange-400">
        <span className="text-orange-500/60">{"////"}</span> Mission lineup
      </p>
      <p className="mb-4 font-mono text-[9px] tracking-widest text-slate-500">5 EVENTS · 12-15 OCT · SKIT JAIPUR</p>
      <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-gradient-to-b before:from-orange-500/60 before:via-orange-500/25 before:to-transparent">
        {LINEUP.map((item, i) => (
          <li key={item.slug}>
            <Link href={item.href} className="group relative flex gap-3 rounded-sm py-2 pl-0 pr-2 transition-colors hover:bg-white/[0.04]">
              <span className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rotate-45 border border-orange-500/70 bg-[#05060a] transition-colors group-hover:bg-orange-500" aria-hidden="true" />
              <span className="min-w-0">
                <span className="flex items-baseline gap-2 font-mono text-[9px] tracking-widest text-slate-500">
                  <span className="text-orange-400/80">{String(i + 1).padStart(2, "0")}</span>
                  {item.date} · {item.when.toUpperCase()}
                </span>
                <span className="block font-orbitron text-[12px] font-bold uppercase leading-snug tracking-wider text-slate-100 transition-colors group-hover:text-orange-300">
                  {item.label}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function LaunchControl() {
  const now = useNow();
  const live = now !== null && now >= OPENS_AT && now < CLOSES_AT;
  const over = now !== null && now >= CLOSES_AT;
  const diff = now === null ? null : Math.max(OPENS_AT - now, 0);
  const units = [
    { label: "DAYS", value: diff === null ? null : Math.floor(diff / 86_400_000) },
    { label: "HRS", value: diff === null ? null : Math.floor(diff / 3_600_000) % 24 },
    { label: "MIN", value: diff === null ? null : Math.floor(diff / 60_000) % 60 },
    { label: "SEC", value: diff === null ? null : Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div className="relative text-right">
      <Ruler side="right" />
      <p className="mb-1 flex items-center justify-end gap-2 font-hud text-[10px] font-bold uppercase tracking-[0.35em] text-orange-400">
        Launch control <span className="text-orange-500/60">{"////"}</span>
      </p>
      <p className="mb-4 font-mono text-[9px] tracking-widest text-slate-500">
        {over ? "MISSION COMPLETE" : live ? "IGNITE IS LIVE" : "T-MINUS TO IGNITION"}
      </p>

      {!live && !over && (
        <div className="mb-5 grid grid-cols-4 gap-1.5" role="timer">
          {units.map((u) => (
            <div key={u.label} className="rounded-sm border border-orange-500/25 bg-black/50 py-2 text-center">
              <div className="font-orbitron text-lg font-black tabular-nums text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                {u.value === null ? "--" : String(u.value).padStart(2, "0")}
              </div>
              <div className="font-hud text-[8px] font-bold tracking-[0.2em] text-slate-500">{u.label}</div>
            </div>
          ))}
        </div>
      )}

      <dl className="mb-5 space-y-2 font-mono text-[10px] tracking-widest">
        {[
          REGISTRATIONS_OPEN
            ? { k: "STATUS", v: "REGISTRATIONS LIVE", accent: "text-emerald-400" }
            : { k: "STATUS", v: "REGISTRATIONS CLOSED", tone: "text-red-300" },
          { k: "PS", v: "LIVE NOW", accent: "text-emerald-400", href: PS_PAGE_PATH },
          { k: "PRIZE POOL", v: HACKATHON.prizePool.toUpperCase(), tone: "text-amber-300" },
          { k: "VENUE", v: "SKIT JAIPUR" },
          { k: "MODE", v: "IN-PERSON" },
          { k: "PAYLOAD", v: "5 EVENTS · 4 DAYS" },
        ].map((row) => (
          <div key={row.k} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
            <dt className="text-slate-500">{row.k}</dt>
            <dd className={row.accent ?? row.tone ?? "text-slate-200"}>
              {row.accent && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 align-middle" />}
              {row.href ? (
                <Link href={row.href} className="underline decoration-emerald-400/40 underline-offset-4 transition-colors hover:text-emerald-200">
                  {row.v} →
                </Link>
              ) : (
                row.v
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* Decorative signal meter */}
      <div className="mb-5 flex h-6 items-end justify-end gap-[3px]" aria-hidden="true">
        {[40, 65, 50, 85, 60, 95, 70, 55, 80, 45, 90, 62].map((h, i) => (
          <span
            key={i}
            className="ignite-hero-signal w-[3px] rounded-[1px] bg-orange-500/70"
            style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Link href={REGISTRATIONS_OPEN ? "/events" : PS_PAGE_PATH} className="ignite-btn-primary rounded-sm px-4 py-2 font-orbitron text-[10px] font-bold tracking-widest text-black">
          {REGISTRATIONS_OPEN ? "CHOOSE YOUR EVENT" : "VIEW PROBLEM STATEMENTS"}
        </Link>
        <Link href="/rulebooks" className="font-hud text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 transition-colors hover:text-orange-300">
          Rulebooks &amp; programmes →
        </Link>
      </div>
    </div>
  );
}

export default function HeroRails() {
  return (
    <>
      <aside className="ignite-hero-rail left-[clamp(40px,3.5vw,72px)]">
        <div className="ignite-panel ignite-hud-bracket w-full bg-black/45 p-5">
          <MissionLineup />
        </div>
      </aside>
      <aside className="ignite-hero-rail right-[clamp(40px,3.5vw,72px)]">
        <div className="ignite-panel ignite-hud-bracket w-full bg-black/45 p-5">
          <LaunchControl />
        </div>
      </aside>
    </>
  );
}
