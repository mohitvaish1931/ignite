"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Trophy, Users } from "lucide-react";
// Events are served from lib/events.ts while the database is switched off (see _backend/README.md)
// import { getPublicEvents } from "../actions/events";
import { EVENTS, cardImage, type SiteEvent } from "../../lib/events";
import HackathonAirlock from "../components/HackathonAirlock";
import { isHackathonEvent } from "../../lib/hackathon-rules";
import { getGuide } from "../../lib/guides";

const FLAGSHIP = "FLAGSHIP EVENTS";
const HACKATHONS = "HACKATHONS";
const TABS = [FLAGSHIP, HACKATHONS];

const CARD_CLIP =
  "polygon(15px 0, 35% 0, 40% 18px, 60% 18px, 65% 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)";

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function EventCard({ event, index }: { event: SiteEvent; index: number }) {
  const isHackathon = isHackathonEvent(event);
  const guide = getGuide(event.slug);
  const noRegistration = guide?.registration.mode === "none";
  const externalForm = guide?.registration.mode === "external";
  const status =
    event.state === "LIVE" ? { label: "LIVE NOW", className: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" }
    : event.state === "REGISTRATION_OPEN" ? { label: "REG. OPEN", className: "text-orange-300 border-orange-500/40 bg-orange-500/10" }
    : { label: "UPCOMING", className: "text-slate-300 border-white/15 bg-white/5" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06 }}
      className="group relative aspect-[3/4] w-full"
    >
      <div className="absolute -inset-4 -z-20 bg-orange-600/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <Link
        href={`/events/${event.slug}`}
        className="relative block h-full w-full bg-white/20 p-[1px] transition-colors duration-500 group-hover:bg-orange-500/60"
        style={{ clipPath: CARD_CLIP }}
        aria-label={`${event.name}: view details`}
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050508]" style={{ clipPath: CARD_CLIP }}>
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 pt-1 font-orbitron text-[10px] font-bold tracking-[0.3em] text-white">
            EVENTS
          </div>
          <div className="absolute right-2 top-28 z-20 font-orbitron text-[7px] tracking-[0.5em] text-white opacity-80" style={{ writingMode: "vertical-rl" }}>
            {isHackathon ? "HACKATHON" : "FLAGSHIP"}
          </div>

          <div className="absolute left-1 top-24 z-20 flex flex-col gap-2">
            <div className="h-1.5 w-1.5 bg-white" />
            <div className="h-1.5 w-1.5 bg-white" />
            <div className="h-1.5 w-1.5 bg-white" />
            <div className="mt-1 h-16 w-1.5 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#f97316_2px,#f97316_4px)] opacity-70" />
          </div>

          {/* Artwork */}
          <div className="relative z-10 h-1/2 w-full p-4 pt-7 transition-all duration-500 group-hover:p-5 group-hover:pt-7">
            <div className="relative h-full w-full overflow-hidden border border-white/10 bg-[#0a0a0f] transition-colors duration-500 group-hover:border-orange-500/40">
              {/* Event photo (Unsplash CDN, already sized); warmed and darkened to sit in the theme */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...cardImage(event)}
                sizes="(max-width: 640px) 90vw, 340px"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-75 saturate-[0.85] transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-orange-500/10" />
              <div className="pointer-events-none absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
              <span className={`absolute right-2 top-2 rounded-sm border px-2 py-0.5 font-hud text-[10px] font-bold tracking-widest backdrop-blur-sm ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-5 text-center">
            {event.category?.name && (
              <span className="mb-2 font-hud text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400/80">{event.category.name}</span>
            )}
            <h3 className="mb-3 line-clamp-2 font-orbitron text-lg font-bold uppercase leading-tight tracking-wider text-white">
              {event.name}
            </h3>
            <div className="flex flex-col items-center gap-1.5 font-hud text-xs font-semibold tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-orange-500" />{formatDate(event.startAt)}</span>
              {guide && (
                <span className="flex items-center gap-2 text-center">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span className="line-clamp-1">{guide.venue.toUpperCase()}</span>
                </span>
              )}
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-orange-500" />
                {noRegistration
                  ? "NO REGISTRATION NEEDED"
                  // External form sign-ups aren't counted on this site
                  : externalForm ? (event.capacity ? `LIMITED TO ${event.capacity} SEATS` : "REGISTER VIA OFFICIAL FORM")
                  : event.capacity ? `${event.capacity} SEATS` : "OPEN TO ALL"}
              </span>
            </div>
            <span className="mt-auto flex items-center gap-1 border-b border-orange-400/60 pb-0.5 font-orbitron text-[11px] tracking-widest text-orange-400 transition-colors group-hover:border-white group-hover:text-white">
              VIEW DETAILS <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function EventsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col px-4 pb-20 pt-12 sm:px-8">
      <div className="flex flex-col items-center">
        <p className="ignite-eyebrow mb-4"><span className="text-orange-500/60">{"////"}</span> IEEE IGNITE &apos;26</p>
        <h1
          className="bg-clip-text text-center font-orbitron text-[56px] font-black tracking-widest text-transparent md:text-[96px]"
          style={{
            backgroundImage: "linear-gradient(to bottom, #ffffff 0%, #a0a0a0 50%, #404040 100%)",
            filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.8))",
          }}
        >
          EVENTS
        </h1>
      </div>

      {/* The open tab comes from the URL, which only the browser knows on a prerendered page */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <div className="ignite-spinner" />
          </div>
        }
      >
        <EventsBrowser />
      </Suspense>
    </div>
  );
}

function EventsBrowser() {
  const searchParams = useSearchParams();
  // ?tab=hackathons opens straight into the hackathon airlock
  const [activeTab, setActiveTab] = useState(() => (searchParams.get("tab") === "hackathons" ? HACKATHONS : FLAGSHIP));

  // While the database is switched off the list is static (it used getPublicEvents() before)
  const events = EVENTS;

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    // Keep the URL shareable without adding history entries
    const url = new URL(window.location.href);
    if (tab === HACKATHONS) url.searchParams.set("tab", "hackathons");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url);
  };

  // Hackathons (tracks or the Hackathon category) go behind the gate; everything else is a flagship event
  const hackathons = useMemo(() => events.filter(isHackathonEvent), [events]);
  const flagship = useMemo(() => events.filter((e) => !isHackathonEvent(e)), [events]);
  const visible = activeTab === HACKATHONS ? hackathons : flagship;

  return (
    <>
      <div className="mb-12 mt-8 flex max-w-4xl flex-wrap justify-center gap-x-10 gap-y-3 self-center md:gap-x-16" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => selectTab(tab)}
            className={`relative pb-2 font-orbitron text-xs font-bold tracking-widest transition-colors md:text-sm ${
              activeTab === tab ? "text-orange-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
            )}
          </button>
        ))}
      </div>

      <div className="mb-8 flex w-full items-center">
        <div className="relative mr-4 flex h-8 w-8 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-md" />
          <div className="relative z-10 h-4 w-4 bg-orange-400" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
        </div>
        <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest text-white md:text-2xl">{activeTab}</h2>
        <div className="relative mx-6 h-px flex-1 bg-white/20">
          <div className="absolute left-0 top-0 h-px w-32 bg-gradient-to-r from-orange-500 to-transparent shadow-[0_0_10px_#f97316]" />
        </div>
        <span className="font-hud text-sm font-bold tracking-widest text-slate-500">{String(visible.length).padStart(2, "0")}</span>
      </div>

      {activeTab === HACKATHONS ? (
        <HackathonAirlock hackathons={hackathons} />
      ) : visible.length === 0 ? (
        <div className="ignite-panel mx-auto w-full max-w-lg border-dashed p-12 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-700" />
          <p className="text-slate-400">No events here yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((event, i) => (
            <EventCard key={event.slug} event={event} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
