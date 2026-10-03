"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { ArrowRight, Calendar, CheckCircle2, MapPin, QrCode as QrCodeIcon, Trophy, Users } from "lucide-react";
import { getDashboardData } from "../actions/dashboard";

const longDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

function eventStatus(startAt: string | Date, endAt: string | Date) {
  const now = new Date();
  if (now > new Date(endAt)) return { label: "Completed", className: "text-slate-400" };
  if (now >= new Date(startAt)) return { label: "Live", className: "text-emerald-400" };
  return { label: "Upcoming", className: "text-orange-300" };
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await getDashboardData();
      if (res.success && res.user) {
        setData(res);
        setLoading(false);
      } else {
        // Not logged in: go home and open the login popup there
        window.location.href = "/";
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="ignite-spinner" />
      </div>
    );
  }

  if (!data?.user) return null;
  const { user, registrations, teams } = data;

  // Registrations arrive sorted by event start. Default ticket: the live or next upcoming event.
  const now = new Date();
  const upcoming = registrations?.find((reg: any) => new Date(reg.event.endAt) >= now);
  const ticket =
    registrations?.find((reg: any) => reg.id === selectedRegId) ||
    upcoming ||
    registrations?.[registrations.length - 1];
  const qrValue = ticket?.qrCode;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-8">
      <div>
        <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> Mission Control</p>
        <h1 className="ignite-title text-3xl md:text-4xl">
          Welcome, <span className="text-orange-500">{user.firstName}</span>
        </h1>
      </div>

      <div className="flex w-full flex-col gap-8 lg:flex-row">
        {/* Profile */}
        <aside className="ignite-panel ignite-hud-bracket flex w-full shrink-0 flex-col items-center overflow-hidden p-8 text-center lg:w-80">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" />
          <div className="mb-4 mt-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-orange-500/50 bg-orange-500/10 font-orbitron text-3xl font-bold text-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.25)]">
            {user.firstName?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mb-1 font-orbitron text-xl font-bold text-white">{displayName}</h2>
          <p className="break-all text-sm text-slate-400">{user.email}</p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3 font-hud">
            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-3">
              <div className="font-orbitron text-xl font-bold text-white">{registrations.length}</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400">EVENTS</div>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-3">
              <div className="font-orbitron text-xl font-bold text-white">{teams.length}</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400">TEAMS</div>
            </div>
          </div>
        </aside>

        {/* Active ticket */}
        <div className="flex flex-1 flex-col gap-8 md:flex-row">
          {ticket && (
            <div className="ignite-panel flex-1 p-8">
              <h3 className="ignite-title mb-1 text-xl">Event Details</h3>
              <p className="mb-6 border-b border-white/10 pb-4 font-bold text-orange-400">{ticket.event.name}</p>
              <div className="flex flex-col gap-5">
                {[
                  { icon: Calendar, label: "Start Date", value: longDate(ticket.event.startAt) },
                  { icon: Calendar, label: "End Date", value: longDate(ticket.event.endAt) },
                  { icon: MapPin, label: "Location", value: "SKIT, Jaipur" },
                  { icon: Users, label: "Participants", value: `${ticket.event._count.registrations} Registered` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    <div>
                      <p className="mb-1 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                      <p className="text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qrValue ? (
            <div className="ignite-panel ignite-hud-bracket flex flex-col items-center overflow-hidden p-8 text-center md:w-80">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="mb-2 font-orbitron text-xl font-bold tracking-widest text-emerald-400">
                {ticket.checkedIn ? "CHECKED IN" : "YOUR PASS"}
              </h3>
              <p className="mb-6 max-w-[240px] text-sm leading-relaxed text-slate-400">
                {ticket.checkedIn ? "You have been checked in. Enjoy the event!" : "Show this QR code at the entry desk to check in."}
              </p>
              <div className="flex h-48 w-48 items-center justify-center rounded-sm bg-white p-4 shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                <QRCode value={qrValue} size={160} className="h-full w-full" />
              </div>
              <p className="mt-5 font-mono text-xs tracking-wider text-slate-500">TICKET ID: {qrValue.slice(0, 8).toUpperCase()}</p>
            </div>
          ) : (
            <div className="ignite-panel flex flex-col items-center justify-center p-8 text-center md:w-80">
              <QrCodeIcon className="mb-6 h-20 w-20 text-slate-700" />
              <h3 className="mb-2 font-orbitron text-lg font-bold text-slate-400">NO ACTIVE PASS</h3>
              <p className="mb-6 text-sm text-slate-500">Register for an event to get your QR pass here.</p>
              <Link href="/events" className="ignite-link">Browse events</Link>
            </div>
          )}
        </div>
      </div>

      {/* My registrations */}
      <section className="ignite-panel p-8">
        <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
          <Calendar className="h-5 w-5 text-orange-500" /> My Registrations
        </h2>
        {registrations?.length === 0 ? (
          <div className="rounded-sm border border-dashed border-white/10 py-12 text-center">
            <p className="mb-5 text-slate-400">You haven&apos;t registered for any events yet.</p>
            <Link href="/events" className="ignite-btn-primary inline-block rounded-sm px-6 py-2.5 font-orbitron text-sm font-bold tracking-wider text-black">
              BROWSE EVENTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((reg: any) => {
              const status = eventStatus(reg.event.startAt, reg.event.endAt);
              const selected = reg.id === ticket?.id;
              return (
                <div key={reg.id} className={`ignite-panel-hover rounded-sm border p-5 ${selected ? "border-orange-500/50 bg-orange-500/[0.06]" : "border-white/10 bg-white/[0.02]"}`}>
                  <h3 className="mb-2 font-orbitron text-lg font-bold text-white">{reg.event.name}</h3>
                  <div className="flex flex-col gap-1 text-sm text-slate-400">
                    <p className="flex flex-wrap justify-between gap-2">
                      <span>Event: <span className={status.className}>{status.label}</span></span>
                      <span>Status: <span className="text-orange-300">{reg.checkedIn ? "Checked in" : reg.status.replace("_", " ").toLowerCase()}</span></span>
                    </p>
                    <p>Date: {new Date(reg.event.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-6">
                    <Link href={`/events/${reg.event.id}`} className="flex items-center gap-2 text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300">
                      View Event <ArrowRight className="h-4 w-4" />
                    </Link>
                    {reg.qrCode && (
                      <button
                        onClick={() => { setSelectedRegId(reg.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-500 transition-colors hover:text-emerald-400"
                      >
                        <QrCodeIcon className="h-4 w-4" /> {reg.checkedIn ? "Checked In" : "Show QR"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My teams */}
      <section className="ignite-panel p-8">
        <h2 className="ignite-title mb-6 flex items-center gap-3 text-xl">
          <Trophy className="h-5 w-5 text-orange-500" /> My Teams
        </h2>
        {teams?.length === 0 ? (
          <div className="rounded-sm border border-dashed border-white/10 py-12 text-center">
            <p className="mb-5 text-slate-400">You are not part of any team.</p>
            <Link href="/teams" className="ignite-btn-secondary inline-block rounded-sm px-6 py-2.5 font-orbitron text-sm font-bold tracking-wider text-neutral-200">
              TEAM HQ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((t: any) => (
              <div key={t.id} className="ignite-panel-hover rounded-sm border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-orbitron text-lg font-bold text-white">{t.team.name}</h3>
                  <span className="rounded-sm bg-orange-500/15 px-2 py-1 font-hud text-xs font-bold uppercase tracking-widest text-orange-400">{t.role}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-slate-400">
                  <p>Event: <span className="text-white">{t.team.event.name}</span></p>
                  <p className="mt-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    {t.team._count.members} Members
                  </p>
                </div>
                <Link href={`/teams/${t.team.id}`} className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300">
                  Open Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
