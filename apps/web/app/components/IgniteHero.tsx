"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Starfield from "./Starfield";
import { SkitLogo } from "./SkitLogo";
import HeroRails from "./HeroRails";

// Accounts are switched off for now (see _backend/README.md); this was the signed-in user
// type HeroUser = { firstName?: string | null } | null;

const NAV_LINKS = [
  { label: "About", href: "#about", className: "hidden md:inline" },
  // The full Events page (tabs, the hackathon gate, every event), not the home section below
  { label: "Events", href: "/events", className: "hidden sm:inline" },
  { label: "Schedule", href: "#schedule", className: "hidden md:inline" },
  { label: "Team", href: "#team", className: "hidden sm:inline" },
];

const STATS = [
  { value: "04 DAYS", label: "12 - 15 OCTOBER", color: "text-white" },
  { value: "05", label: "IEEE IGNITE EVENTS", color: "text-orange-400" },
  { value: "24 HRS", label: "SOFTWARE & HARDWARE HACKATHON", color: "text-white" },
  { value: "FREE", label: "SYMPOSIUM, PANEL & TALKS", color: "text-amber-400" },
];

/**
 * A box with the poster's aspect ratio that covers its parent exactly like
 * object-fit: cover. Anything inside can be pinned to a spot on the artwork with
 * percentages, and sized with cqw (1cqw = 1% of the poster's rendered width),
 * so the animated rings and flare stay locked onto the poster at every screen size.
 * On wide screens a true cover would blow the 1214px artwork up ~3x, so its scale is
 * capped at 125% of "fit to height" and its edges fade into the starfield instead.
 * On phones the hero is tall and narrow, so cover would crop the lettering; there the
 * poster is sized to the width and pinned to the top instead, and the content column
 * reserves that space with a phone-only spacer.
 */
function PosterCover({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ containerType: "size" }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-6cqw] w-[125cqw] sm:top-1/2 sm:-translate-y-1/2 sm:w-[min(max(100cqw,calc(100cqh*607/709)),calc(100cqh*607/709*1.25))]"
        style={{ aspectRatio: "607 / 709", containerType: "inline-size" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Pulsing ignition flare, pinned to the rocket that forms the second "I" of IGNITE on the poster. */
function RocketFlare() {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{ left: "54.7%", top: "calc(51.5% + 2cqw)" }}
    >
      <div className="relative flex items-center justify-center w-[2.67cqw] h-[8.9cqw]">
        {/* Upward rocket plume flare stream */}
        <div className="absolute -top-[1.33cqw] w-[0.67cqw] h-[7.1cqw] bg-gradient-to-t from-transparent via-[#ff8800] to-white rounded-full blur-[1px] ignite-plume" />
        {/* Intense core beam */}
        <div className="absolute top-[0.44cqw] w-[0.34cqw] h-[6.2cqw] bg-gradient-to-b from-white via-[#ff951e] to-[#ff4400] rounded-sm shadow-[0_0_12px_#ff9500,0_0_24px_#ff5500]" />
        {/* Ignition blast point with horizon arc flare */}
        <div className="absolute bottom-[0.89cqw] w-[2.2cqw] h-[2.2cqw] bg-white rounded-full blur-[1.5px] shadow-[0_0_16px_#ffffff,0_0_35px_#ff8c00]" />
        <div className="absolute bottom-[1.33cqw] w-[4.4cqw] h-[0.89cqw] bg-[#ffaa00] rounded-full blur-[3px]" />
      </div>
    </div>
  );
}

export default function IgniteHero() {
  return (
    <section className="relative w-full bg-[#030408] font-grotesk text-white">
      <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden">
        {/* LAYER 1: starfield */}
        <Starfield className="z-0" />

        {/* LAYER 2: poster artwork (Sponsorship Proposal text removed), shaded top and bottom */}
        <div className="absolute inset-0 z-10 select-none pointer-events-none">
          <PosterCover>
            {/* Fade the poster's edges so it melts into the full-screen starfield */}
            <div
              className="absolute inset-0"
              style={{
                maskImage: "radial-gradient(ellipse closest-side at 50% 45%, #000 68%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse closest-side at 50% 45%, #000 68%, transparent 100%)",
              }}
            >
              <Image
                src="/ignite-poster.png"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 125vw, 110vh"
                className="opacity-90 mix-blend-screen scale-[1.01]"
              />
            </div>
          </PosterCover>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/90 via-transparent to-[#030408]/95" />
          <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-[#020306] via-[#020306] to-transparent" />
        </div>

        {/* Soft nebula glow at the far left and right, so wide screens don't end in flat black */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse 38% 55% at 0% 52%, rgba(249,115,22,0.09), transparent 70%), radial-gradient(ellipse 38% 55% at 100% 52%, rgba(249,115,22,0.09), transparent 70%)",
          }}
        />

        {/* LAYERS 3-5: breathing amber core, golden orbital rings, radar sweep, glint and rocket flare */}
        <PosterCover className="z-20">
          <div className="absolute left-1/2 top-[43.5%] w-[42.7cqw] h-[42.7cqw] rounded-full bg-gradient-to-tr from-amber-600/40 via-orange-500/30 to-amber-300/20 ignite-core" />
          <div className="absolute left-1/2 top-[43.5%] -translate-x-1/2 -translate-y-1/2 w-[23.1cqw] h-[23.1cqw] rounded-full bg-orange-500/15 blur-2xl animate-pulse [animation-duration:3.2s]" />

          <div className="absolute left-1/2 top-[43.5%] w-[57.8cqw] h-[25cqw] rounded-[100%] border-[1.5px] border-[#ff9d3a]/40 shadow-[0_0_18px_rgba(255,145,36,0.35)] ignite-orbit-1" />
          <div className="absolute left-1/2 top-[43.5%] w-[53.3cqw] h-[20.6cqw] rounded-[100%] border-[1.2px] border-[#ffb65c]/35 shadow-[0_0_15px_rgba(255,170,70,0.3)] ignite-orbit-2" />

          <div className="absolute left-1/2 top-[43.5%] w-[60cqw] h-[60cqw] opacity-30 ignite-radar">
            <svg className="w-full h-full" viewBox="0 0 520 520" aria-hidden="true">
              <line stroke="rgba(255, 170, 70, 0.45)" strokeDasharray="4 2" strokeWidth="0.8" x1="260" x2="510" y1="260" y2="260" />
              <circle cx="260" cy="260" fill="none" r="248" stroke="rgba(255, 255, 255, 0.12)" strokeDasharray="2 6" strokeWidth="0.6" />
            </svg>
          </div>

          <div className="absolute top-[38.9%] inset-x-0 h-[12.4cqw] overflow-hidden">
            <div className="w-[10.7cqw] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent ignite-glint" />
          </div>

          <RocketFlare />
        </PosterCover>

        {/* LAYER 6: landing content & technical HUD */}
        <div className="relative z-30 flex w-full flex-1 flex-col justify-between px-4 pt-4 pb-4 sm:px-8 xl:px-[clamp(40px,3.5vw,72px)]">
          <h1 className="sr-only">IEEE IGNITE &apos;26 - Annual Flagship Technical Conclave &amp; Global Hackathon</h1>

          {/* Navigation header */}
          <header className="flex w-full items-center justify-between gap-3 border-b border-white/10 pb-3 pt-1 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
              <SkitLogo priority className="h-9 w-auto" />
              <span className="h-7 w-px bg-white/15" aria-hidden="true" />
              <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="IEEE IGNITE '26 home">
                <Image src="/ignite-wordmark.png" alt="IEEE IGNITE" width={93} height={40} priority className="h-10 w-auto" />
                <span className="whitespace-nowrap rounded border border-orange-500/40 bg-orange-500/20 px-1.5 py-0.5 font-mono text-[9px] tracking-normal text-orange-400">&apos;26</span>
              </Link>
              <div className="hidden items-center gap-1.5 whitespace-nowrap border-l border-white/15 pl-3 font-mono text-[10px] text-emerald-400 sm:flex">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span>REGISTRATIONS LIVE</span>
              </div>
            </div>

            <nav className="flex shrink-0 items-center gap-2 font-hud text-[11px] uppercase tracking-widest text-neutral-300 sm:gap-5 sm:text-xs">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={`transition-colors hover:text-orange-400 ${link.className}`}>
                  {link.label}
                </Link>
              ))}
              {/* Accounts are switched off for now (see _backend/README.md)
              {user ? (
                <Link href="/dashboard" className="whitespace-nowrap transition-colors hover:text-orange-400">
                  Dashboard
                </Link>
              ) : (
                <button onClick={onLogin} className="whitespace-nowrap uppercase tracking-widest transition-colors hover:text-orange-400">
                  Login
                </button>
              )}
              */}
              <Link
                href="/events"
                className="whitespace-nowrap rounded border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-orange-300 shadow-[0_0_10px_rgba(255,140,0,0.2)] transition-all hover:bg-orange-500 hover:text-black sm:text-xs"
              >
                REGISTER
              </Link>
            </nav>
          </header>

          {/* Tech telemetry sub-bar */}
          <div className="flex w-full items-center justify-between gap-4 pt-2 font-hud text-[9px] tracking-widest text-gray-500">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-orange-400/80">SYS.LOC:</span>
              {/* SKIT, Jagatpura, Jaipur (approximate) */}
              <span>26.82° N, 75.86° E</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap text-right">
              <span className="hidden text-white/40 sm:inline">EDITION // 06</span>
              <span className="text-orange-400/80">ORBITAL PROTOCOL: READY</span>
            </div>
          </div>

          {/* Central hero spacer / title focus */}
          <div className="flex flex-1 flex-col items-center justify-end pb-3 text-center">
            {/* Phones: keep the text below the poster's IEEE IGNITE lettering */}
            <div className="h-[50vw] shrink-0 sm:hidden" aria-hidden="true" />
            <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-orange-500" />
              <p className="font-hud text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-200 sm:whitespace-nowrap sm:text-sm sm:tracking-[0.22em]">
                Empowering Innovation • Igniting Minds
              </p>
            </div>
            <p className="mb-3 font-hud text-[11px] font-medium uppercase tracking-[0.25em] text-orange-400/90 sm:text-xs">
              Annual Flagship Technical Conclave &amp; Global Hackathon
            </p>
            <div className="ignite-pixel-dates mb-1 uppercase text-white">12 - 15 OCTOBER &apos;26</div>
            <p className="mb-6 font-hud text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:text-xs">
              SKIT Jaipur // In-Person Experience
            </p>
            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/events" className="ignite-btn-primary group flex items-center gap-2 whitespace-nowrap rounded-sm px-6 py-2.5 font-orbitron text-xs font-bold uppercase tracking-wider text-black sm:text-sm">
                <span>Register Now</span>
                <svg className="h-4 w-4 fill-current transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z" />
                </svg>
              </Link>
              <a href="#about" className="ignite-btn-secondary whitespace-nowrap rounded-sm px-5 py-2.5 font-orbitron text-xs font-medium uppercase tracking-wider text-neutral-200 hover:text-white sm:text-sm">
                Explore Conclave
              </a>
            </div>
          </div>

          {/* Bottom footer & quick stats banner */}
          <footer className="w-full border-t border-white/10 pt-3">
            <div className="grid grid-cols-2 gap-2 text-center font-hud sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="ignite-hud-bracket rounded border border-white/5 bg-white/[0.02] p-1.5">
                  <div className={`font-orbitron text-base font-bold sm:text-lg ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] tracking-wider text-neutral-400 sm:text-[10px]">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 px-1 pt-2.5 font-mono text-[9px] text-gray-500">
              <span>IEEE STUDENT BRANCH // ALL RIGHTS RESERVED</span>
              <span className="hidden sm:inline">NODE: IGN-2026-ONLINE</span>
            </div>
          </footer>
        </div>

        {/* Wide screens: event lineup and launch countdown either side of the poster */}
        <HeroRails />

        {/* Subtle vignette framing for deep cosmic edge contrast */}
        <div className="pointer-events-none absolute inset-0 z-[35] shadow-[inset_0_0_55px_rgba(2,3,6,0.9),inset_0_0_120px_rgba(0,0,0,0.65)]" />
      </div>
    </section>
  );
}
