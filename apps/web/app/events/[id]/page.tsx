"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { ArrowLeft, BookOpen, Calendar, CalendarDays, CheckCircle2, Clock, Info, Lock, MapPin, Phone, ShieldCheck, Trophy, Users } from "lucide-react";
import { getEventDetails } from "../../actions/registrations";
import { RegistrationModal } from "../../components/RegistrationModal";
import { MAX_TEAM_SIZE, isHackathonEvent } from "../../../lib/hackathon-rules";
import { getGuide, guidePath, hasDocument } from "../../../lib/guides";
import { ProgrammeTimeline } from "../../components/ProgrammeTimeline";

const STATE_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  PUBLISHED: "Upcoming",
  REGISTRATION_OPEN: "Registration Open",
  REGISTRATION_CLOSED: "Registration Closed",
  LIVE: "Live Now",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

// Times read in the event's own timezone (e.g. IST for SKIT Jaipur); "UTC" is the unset default, so use the viewer's
const formatDateTime = (d: string | Date, timeZone?: string) =>
  new Date(d).toLocaleString("en-US", {
    weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit",
    ...(timeZone && timeZone !== "UTC" ? { timeZone, timeZoneName: "short" } : {}),
  });

/** "Tue, 13 Oct 2026 · 10:30 AM - 1:30 PM" for one day, "12 Oct - 13 Oct 2026" across days. */
function whenLabel(start: string | Date, end: string | Date, timeZone?: string) {
  const tz = timeZone && timeZone !== "UTC" ? timeZone : undefined;
  const date = (d: string | Date, o: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString("en-GB", { ...o, timeZone: tz });
  const time = (d: string | Date) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
  const sameDay = date(start, { dateStyle: "short" }) === date(end, { dateStyle: "short" });
  return sameDay
    ? `${date(start, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${time(start)} - ${time(end)}`
    : `${date(start, { day: "numeric", month: "short" })} - ${date(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** "24 hours" for a single stretch; "2 days" for an event spread over calendar days. */
function durationLabel(start: string | Date, end: string | Date, timeZone?: string) {
  const hours = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3_600_000));
  if (hours <= 24) return `${hours} hours`;
  const tz = timeZone && timeZone !== "UTC" ? timeZone : undefined;
  const day = (d: string | Date) => Date.parse(new Date(d).toLocaleDateString("en-CA", { timeZone: tz }));
  const days = Math.round((day(end) - day(start)) / 86_400_000) + 1;
  return `${days} days`;
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [eventData, setEventData] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"register" | "join">("register");

  useEffect(() => {
    async function fetchDetails() {
      const res = await getEventDetails(resolvedParams.id);
      if (res.success && res.data) {
        setEventData(res.data.event);
        setIsRegistered(res.data.isRegistered);
        setCheckedIn(res.data.checkedIn);
        setQrToken(res.data.qrCode);
        setClosedReason(res.data.registrationClosedReason);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [resolvedParams.id]);

  const handleOpenModal = (mode: "register" | "join") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="ignite-spinner" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <h1 className="ignite-title mb-3 text-3xl">Event not found</h1>
        <p className="mb-8 text-slate-400">This event doesn&apos;t exist or is no longer available.</p>
        <Link href="/events" className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black">
          BROWSE EVENTS
        </Link>
      </div>
    );
  }

  const isHackathon = isHackathonEvent(eventData);
  // The event's official rulebook, when it has one
  const guide = getGuide(eventData.slug);
  const spotsLeft = eventData.capacity ? Math.max(eventData.capacity - eventData._count.registrations, 0) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <Link href="/events" className="mb-6 inline-flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-[0.25em] text-slate-400 transition-colors hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      {/* Event banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ignite-panel ignite-hud-bracket relative flex min-h-[360px] w-full flex-col justify-end overflow-hidden p-8 md:min-h-[420px] md:p-12"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={eventData.imageUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030408] via-[#030408]/80 to-transparent" />

        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-orange-500/40 bg-orange-500/15 px-3 py-1 font-orbitron text-xs font-bold tracking-widest text-orange-400">
              {isHackathon ? "HACKATHON" : (eventData.category?.name ?? "Event").toUpperCase()}
            </span>
            <span className={`rounded-sm border px-3 py-1 font-hud text-xs font-bold uppercase tracking-widest ${eventData.state === "LIVE" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/15 bg-white/5 text-slate-300"}`}>
              {STATE_LABELS[eventData.state] ?? eventData.state}
            </span>
            {eventData.organization?.name && (
              <span className="font-hud text-xs font-semibold uppercase tracking-widest text-slate-400">by {eventData.organization.name}</span>
            )}
          </div>
          <h1 className="mb-4 font-orbitron text-3xl font-bold leading-tight text-white md:text-5xl">{eventData.name}</h1>
          <p className="max-w-3xl whitespace-pre-line text-base text-slate-300 md:text-lg">
            {eventData.summary || eventData.description || "Join us for an incredible journey of technology and innovation."}
          </p>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Main info */}
        <div className="flex-1 space-y-8">
          <section className="ignite-panel p-8">
            <h2 className="ignite-title mb-6 text-xl">Event Details</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                ...(guide?.when
                  ? [
                      { icon: Calendar, label: "Dates", value: guide.when.dates },
                      { icon: Clock, label: "Time", value: guide.when.time },
                    ]
                  : [
                      { icon: Calendar, label: "Starts", value: formatDateTime(eventData.startAt, eventData.timezone) },
                      { icon: Clock, label: "Ends", value: `${formatDateTime(eventData.endAt, eventData.timezone)} (${durationLabel(eventData.startAt, eventData.endAt, eventData.timezone)})` },
                    ]),
                // Hackathon registrations happen on the ERP, so this site's count doesn't apply
                isHackathon
                  ? { icon: Users, label: "Team size", value: `1 to ${MAX_TEAM_SIZE} members, same institution & campus` }
                  : guide?.registration.mode === "none"
                    ? { icon: Users, label: "Registration", value: eventData.capacity ? `Not required · up to ${eventData.capacity} participants` : "Not required" }
                  // Registrations on an external form aren't counted here, so show the limit rather than spots left
                  : guide?.registration.mode === "external"
                    ? eventData.capacity
                      ? { icon: Users, label: "Capacity", value: `Limited to ${eventData.capacity} participants · register via the official form` }
                      : { icon: Users, label: "Registration", value: "Via the official registration form" }
                    : { icon: Users, label: "Capacity", value: spotsLeft !== null ? `${spotsLeft} of ${eventData.capacity} spots left` : `${eventData._count.registrations} registered · Unlimited` },
                { icon: MapPin, label: "Location", value: guide?.venue ?? "SKIT, Jaipur" },
                ...(guide?.details ?? []).map((d) => ({ icon: Info, ...d })),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  <div>
                    <p className="mb-1 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                    <p className="text-slate-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {eventData.summary && eventData.description && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-4 text-xl">About</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-300">{eventData.description}</p>
            </section>
          )}

          {guide?.schedule && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
                <CalendarDays className="h-5 w-5 text-orange-500" /> Schedule
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {guide.schedule.map((d) => (
                  <div key={d.day} className="ignite-hud-bracket rounded-sm border border-white/10 bg-white/[0.03] p-5">
                    <p className="font-orbitron text-xs font-bold tracking-[0.3em] text-orange-500">{d.day.toUpperCase()} · {d.date.toUpperCase()}</p>
                    <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-white">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" /> {d.venue}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {d.activities.map((a) => (
                        <li key={a} className="flex gap-2 text-sm text-slate-300">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-orange-500" aria-hidden="true" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {guide?.programme && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
                <CalendarDays className="h-5 w-5 text-orange-500" /> Programme
              </h2>
              <ProgrammeTimeline items={guide.programme} />
            </section>
          )}

          {guide?.keyRules && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
                <ShieldCheck className="h-5 w-5 text-orange-500" /> Key Rules
              </h2>
              <ul className="space-y-3">
                {guide.keyRules.map((rule) => (
                  <li key={rule} className="flex gap-3 text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-orange-500" aria-hidden="true" />
                    {rule}
                  </li>
                ))}
              </ul>
              <Link href={guidePath(guide.slug)} className="ignite-link mt-6 inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Read the official rulebook
              </Link>
            </section>
          )}

          {guide?.coordinators && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
                <Phone className="h-5 w-5 text-orange-500" /> Event Coordinators
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {guide.coordinators.map((group) => (
                  <div key={group.title}>
                    <p className="ignite-label mb-3">{group.title}</p>
                    <ul className="space-y-2">
                      {group.people.map((p) => (
                        <li key={p.name} className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-white/[0.03] px-4 py-3">
                          <span className="font-semibold text-white">{p.name}</span>
                          <a href={`tel:${p.phone}`} className="flex shrink-0 items-center gap-1.5 font-mono text-sm text-orange-400 hover:text-orange-300">
                            <Phone className="h-3.5 w-3.5" /> {p.phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isHackathon && (
            <section className="ignite-panel p-8">
              <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
                <Trophy className="h-5 w-5 text-orange-500" /> Tracks &amp; Problem Statements
              </h2>
              {eventData.hackathonTracks.length === 0 ? (
                <p className="text-slate-400">Problem statements and tracks are released at the start of the event on this portal. Your team picks one, and that choice is final.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {eventData.hackathonTracks.map((track: any) => (
                    <div key={track.id} className="ignite-hud-bracket rounded-sm border border-white/10 bg-white/[0.03] p-5">
                      <h3 className="mb-2 font-orbitron text-lg font-bold text-white">{track.title}</h3>
                      <p className="text-sm text-slate-400">{track.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Registration / ticket */}
        <aside className="w-full lg:w-96">
          <div className="ignite-panel ignite-hud-bracket sticky top-28 p-8">
            {guide?.registration.mode === "none" ? (
              <div>
                <h3 className="ignite-title mb-3 text-2xl">No Registration Needed</h3>
                <p className="mb-6 text-sm text-slate-400">{guide.registration.note}</p>
                <dl className="space-y-4">
                  {[
                    { icon: Calendar, label: "When", value: guide.when ? `${guide.when.dates} · ${guide.when.time}` : whenLabel(eventData.startAt, eventData.endAt, eventData.timezone) },
                    { icon: MapPin, label: "Where", value: guide.venue },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <div>
                        <dt className="font-hud text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
                        <dd className="text-sm text-slate-200">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {guide.related && (
                  <Link href={guide.related.href} className="ignite-btn-primary mt-8 flex items-center justify-center gap-2 rounded-sm py-3 font-orbitron text-sm font-bold tracking-wider text-black">
                    {guide.related.label}
                  </Link>
                )}
                {hasDocument(guide) && (
                  <Link href={guidePath(guide.slug)} className="ignite-btn-secondary mt-8 flex items-center justify-center gap-2 rounded-sm py-3 font-orbitron text-sm font-bold tracking-wider text-neutral-200">
                    <BookOpen className="h-4 w-4" /> {guide.programme ? "VIEW PROGRAMME" : "READ THE RULEBOOK"}
                  </Link>
                )}
              </div>
            ) : isRegistered ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="ignite-title mb-2 text-2xl">{checkedIn ? "Checked In" : "Registered"}</h3>
                <p className="mb-6 text-sm text-slate-400">
                  {checkedIn
                    ? "You have been checked in. Enjoy the event!"
                    : "You're all set! Show this QR code at the entry desk to check in."}
                </p>
                {qrToken && (
                  <div className="mb-4 inline-block rounded-sm bg-white p-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCode value={qrToken} size={170} />
                  </div>
                )}
                {qrToken && (
                  <p className="font-mono text-xs tracking-wider text-slate-500">TICKET ID: {qrToken.slice(0, 8).toUpperCase()}</p>
                )}
                {isHackathon && !checkedIn && (
                  <p className="mt-6 text-sm text-slate-400">
                    Bring your original college ID and a government photo ID for in-person verification.
                  </p>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  <Link href="/dashboard" className="ignite-link">My dashboard</Link>
                  {isHackathon && <Link href="/teams" className="ignite-link">Form a squad</Link>}
                </div>
              </div>
            ) : closedReason ? (
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="ignite-title mb-3 text-xl">Registration Closed</h3>
                <p className="text-sm text-slate-400">{closedReason}</p>
              </div>
            ) : (
              <div>
                <h3 className="ignite-title mb-3 text-2xl">Join the Event</h3>
                <p className="mb-8 text-sm text-slate-400">
                  Secure your spot at {eventData.name}.
                  {guide?.registration.mode === "external"
                    ? eventData.capacity ? ` Seats are limited to ${eventData.capacity}.` : ""
                    : spotsLeft !== null ? ` ${spotsLeft} of ${eventData.capacity} spots left.` : ""}
                </p>
                <div className="space-y-4">
                  {guide?.registration.mode === "external" ? (
                    // Events with an official form (e.g. the hackathon on the SKIT ERP) register there, without logging in here
                    <a
                      href={guide.registration.url}
                      className="ignite-btn-primary block w-full rounded-sm py-4 text-center font-orbitron text-base font-bold tracking-wider text-black"
                    >
                      REGISTER NOW
                    </a>
                  ) : (
                    <button
                      onClick={() => handleOpenModal("register")}
                      className="ignite-btn-primary w-full rounded-sm py-4 font-orbitron text-base font-bold tracking-wider text-black"
                    >
                      REGISTER NOW
                    </button>
                  )}
                  {/* Joining a team on this site is paused while registration runs on the ERP
                  {isHackathon && (
                    <button
                      onClick={() => handleOpenModal("join")}
                      className="ignite-btn-secondary w-full rounded-sm py-4 font-orbitron text-base font-bold tracking-wider text-neutral-200"
                    >
                      JOIN A TEAM
                    </button>
                  )}
                  */}
                </div>
                {guide?.agreement && (
                  <p className="mt-5 text-center text-xs text-slate-500">
                    Registering means you agree to the{" "}
                    <Link href={guidePath(guide.slug)} className="text-orange-400 underline-offset-2 hover:underline">official rulebook</Link>.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <RegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={eventData.id}
        eventName={eventData.name}
        initialMode={modalMode}
        agreement={guide?.agreementDetail ? { href: guidePath(guide.slug), detail: guide.agreementDetail } : undefined}
        studentsOnly={guide?.studentsOnly}
      />
    </div>
  );
}
