"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Code, MapPin, Mic, Presentation, RadioTower, UsersRound } from "lucide-react";
// Accounts are switched off for now (see _backend/README.md)
// import { getCurrentUser } from "./actions/auth";
import IgniteHero from "./components/IgniteHero";
import IntroLoader from "./components/IntroLoader";
import CommitteeCard from "./components/CommitteeCard";
import { CautionTape } from "./components/CautionTape";
import { REGISTRATIONS_OPEN, bannerImage, cardImage, findEvent } from "../lib/events";
import { PS_COUNT, PS_PAGE_PATH } from "../lib/problem-statements";

// The fest opens with Symposium Day 1: 12 October 2026, 11:00 IST
const IGNITION_AT = new Date("2026-10-12T11:00:00+05:30").getTime();

// The five IEEE IGNITE '26 events, in date order (details live on each event page)
const EVENTS = [
  {
    icon: RadioTower,
    title: "SYMPOSIUM",
    date: "12 - 13 OCT",
    venue: "7F’11 & ECL-06",
    text: "Recent advancements in RF, Microwave, EMI/EMC: expert sessions, hands-on workshops and a technical quiz.",
    href: "/events/ieee-ignite-symposium-2026",
    slug: "ieee-ignite-symposium-2026",
  },
  {
    icon: UsersRound,
    title: "ROUND TABLE CONFERENCE",
    date: "13 OCT",
    venue: "Community Hall, IDEA Lab",
    text: "“Leveraging Technology for a Better Tomorrow”: a keynote and an integrated round table on innovation, sustainability and society.",
    href: "/events/round-table-conference-2026",
    slug: "round-table-conference-2026",
  },
  {
    icon: Mic,
    title: "PANEL DISCUSSION",
    date: "13 OCT",
    venue: "JC Bose",
    text: "Experts share insights on emerging technologies, innovation and industry trends.",
    href: "/events/ieee-ignite-panel-discussion",
    slug: "ieee-ignite-panel-discussion",
  },
  {
    icon: Code,
    title: "HACKATHON",
    date: "14 - 15 OCT",
    venue: "Indoor Sports Complex",
    text: "₹5 lakh prize pool. 24 hours, fully offline: software & hardware builds by teams of 1-4, judged on a working demo.",
    href: "/events?tab=hackathons",
    slug: "ieee-ignite-hackathon-2026",
    featured: true,
  },
  {
    icon: Presentation,
    title: "EXPERT TALK",
    date: "14 - 15 OCT",
    venue: "Indoor Sports Complex",
    text: "An expert talk held during the hackathon.",
    href: "/events/ieee-ignite-expert-talk",
    slug: "ieee-ignite-expert-talk",
  },
];

const SCHEDULE = [
  { day: "DAY 1", date: "12 OCT", time: "11:00 AM", title: "SYMPOSIUM: DAY 1", desc: "Inauguration, expert session and RF & microwave hands-on workshop · 7F’11, Civil Block", href: "/events/ieee-ignite-symposium-2026" },
  { day: "DAY 2", date: "13 OCT", time: "10:30 AM", title: "ROUND TABLE CONFERENCE", desc: "Keynote and round table on leveraging technology for a better tomorrow · Community Hall, IDEA Lab", href: "/events/round-table-conference-2026" },
  { day: "DAY 2", date: "13 OCT", time: "11:00 AM", title: "PANEL DISCUSSION", desc: "Experts on emerging technologies, innovation and industry trends · JC Bose", href: "/events/ieee-ignite-panel-discussion" },
  { day: "DAY 2", date: "13 OCT", time: "11:00 AM", title: "SYMPOSIUM: DAY 2", desc: "Expert session, workshop, technical quiz and valedictory session · ECL-06, CS Block", href: "/events/ieee-ignite-symposium-2026" },
  { day: "DAY 3", date: "14 OCT", time: "10:00 AM", title: "HACKATHON BEGINS", desc: "24 hours of building, with an expert talk during the hackathon · Indoor Sports Complex", href: "/events?tab=hackathons" },
  { day: "DAY 4", date: "15 OCT", time: "10:00 AM", title: "HACKATHON ENDS", desc: "Submissions, working demos and judging", href: "/events?tab=hackathons" },
];

// IEEE IGNITE '26 organizing team. Roles come from the team list; where none was given,
// the member's coordinator tag on Tech Pravah (pravah.skit.ac.in) is used.
const COMMITTEE = [
  {
    title: "Core Team",
    members: [
      { name: "Mohit Lalwani", role: "Technical & Sponsorship Head", authLevel: "ADMIN", imagePath: "/team/mohit-lalwani.webp" },
      { name: "Tanvi Jain", role: "Event Head", authLevel: "ADMIN", imagePath: "/team/tanvi-jain.webp" },
      { name: "Shanker Joshi", role: "Event Head", authLevel: "ADMIN", imagePath: "/team/shanker-joshi.webp" },
      { name: "Ankur Singh", role: "Discipline Head", authLevel: "ADMIN", imagePath: "/team/ankur-singh.webp" },
      { name: "Monika Verma", role: "Design Team Head", authLevel: "ADMIN", imagePath: "/team/monika-verma.webp" },
    ],
  },
  {
    title: "Mentors",
    members: [
      { name: "Rahul Garg", role: "Mentor", authLevel: "ROOT", imagePath: "/team/rahul-garg.webp" },
      { name: "Rudraksh Dusad", role: "Mentor", authLevel: "ROOT", imagePath: "/team/rudraksh-dusad.webp" },
    ],
  },
  {
    title: "Design Team",
    members: [
      { name: "Yash Samriya", role: "Design Team", authLevel: "EXEC", imagePath: "/team/yash-samriya.webp" },
      { name: "Palak Choudhary", role: "Design Team", authLevel: "EXEC", imagePath: "/team/palak-choudhary.webp" },
      { name: "Divyansh Maheshwari", role: "Design Team", authLevel: "EXEC", imagePath: "/team/divyansh-maheshwari.webp" },
      { name: "Divyansh Shah", role: "Designer", authLevel: "EXEC", imagePath: "/team/divyansh-shah.webp" },
      { name: "Tushar Vijay", role: "Video Editor", authLevel: "EXEC", imagePath: "/team/tushar-vijay.webp" },
    ],
  },
  {
    title: "Sponsorship",
    members: [
      { name: "Anshuman Pareek", role: "Sponsorship", authLevel: "EXEC", imagePath: "/team/anshuman-pareek.webp" },
      { name: "Yashneel Singh", role: "Sponsorship · Hackathon Coordinator", authLevel: "EXEC", imagePath: "/team/yashneel-singh.webp" },
    ],
  },
  {
    title: "Organizing Committee",
    members: [
      { name: "Divyansh Bhati", role: "Overall Support", authLevel: "STAFF", imagePath: "/team/divyansh-bhati.webp" },
      { name: "Shaurya", role: "Organizing Committee", authLevel: "STAFF", imagePath: "/team/shaurya.webp" },
      { name: "Aashi Goyal", role: "Round Table Coordinator", authLevel: "STAFF", imagePath: "/team/aashi-goyal.webp" },
      { name: "Aditya Mangal", role: "Panel Discussion Coordinator", authLevel: "STAFF", imagePath: "/team/aditya-mangal.webp" },
      { name: "Mohit Swami", role: "Panel Discussion Coordinator", authLevel: "STAFF", imagePath: "/team/mohit-swami.webp" },
      { name: "Shagun Gautam", role: "Symposium Coordinator", authLevel: "STAFF", imagePath: "/team/shagun-gautam.webp" },
      { name: "Vineet Sharma", role: "Symposium Coordinator", authLevel: "STAFF", imagePath: "/team/vineet-sharma.webp" },
      { name: "Shivang Gupta", role: "Symposium Coordinator", authLevel: "STAFF", imagePath: "/team/shivang-gupta.webp" },
      { name: "Nainika", role: "Organizing Committee", authLevel: "STAFF", imagePath: "/team/nainika.webp" },
      { name: "Kratika Sharma", role: "Round Table Coordinator", authLevel: "STAFF", imagePath: "/team/kratika-sharma.webp" },
      { name: "Ananya", role: "Round Table Coordinator", authLevel: "STAFF", imagePath: "/team/ananya.webp" },
    ],
  },
];

function SectionEyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-4 text-orange-400 font-hud text-sm font-bold tracking-[0.4em] mb-6 ${center ? "justify-center" : ""}`}>
      <span className="text-orange-500/60">{"////"}</span>
      <p>{children}</p>
    </div>
  );
}

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining === null) return null;
  const s = Math.floor(remaining / 1000);
  return {
    live: remaining === 0,
    parts: [
      { label: "DAYS", value: Math.floor(s / 86400) },
      { label: "HOURS", value: Math.floor((s % 86400) / 3600) },
      { label: "MINUTES", value: Math.floor((s % 3600) / 60) },
      { label: "SECONDS", value: s % 60 },
    ],
  };
}

export default function LandingPage() {
  const countdown = useCountdown(IGNITION_AT);

  // Accounts are switched off for now (see _backend/README.md)
  // const [user, setUser] = useState<{ firstName?: string | null } | null>(null);
  // useEffect(() => {
  //   getCurrentUser()
  //     .then((res) => { if (res.success && res.user) setUser(res.user); })
  //     .catch(() => {});
  // }, []);
  // const openLogin = () => window.dispatchEvent(new Event("ignite:open-login"));

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#020306] text-white font-grotesk selection:bg-orange-500/30">
      <IntroLoader />
      <IgniteHero />

      {/* ===================== ABOUT ===================== */}
      <section id="about" className="relative w-full py-24 px-6 md:px-20 border-t border-orange-500/20 bg-gradient-to-b from-[#020306] to-[#07080c]">
        <div className="max-w-4xl mx-auto">
          <SectionEyebrow center>THE ORIGIN</SectionEyebrow>
          <h2 className="text-4xl md:text-6xl font-black font-orbitron text-center mb-10 tracking-wider">
            WHAT IS <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">IEEE IGNITE?</span>
          </h2>
          <div className="ignite-hud-bracket p-8 border border-white/10 bg-white/[0.03] backdrop-blur-sm rounded-sm hover:border-orange-500/40 transition-colors duration-500">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed text-center">
              IEEE IGNITE &apos;26 is the annual flagship technical conclave &amp; hackathon of the IEEE Student Branch, SKIT Jaipur,
              the crucible where the future of technology is forged. We bring together the brightest minds across RF &amp; microwave
              engineering, emerging technologies and hands-on building.
              <br /><br />
              Over 4 days, from 12 to 15 October 2026, at SKIT Jaipur: a two-day technical symposium, a round table conference,
              an expert panel discussion, and the 24-hour IEEE IGNITE Hackathon with an expert talk.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== EVENTS ===================== */}
      <section id="events" className="relative w-full py-24 px-6 md:px-20 border-t border-orange-500/20 bg-[#07080c]">
        <div className="max-w-6xl mx-auto">
          <SectionEyebrow>THE LINEUP</SectionEyebrow>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-14 tracking-wider">IEEE IGNITE EVENTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENTS.map(({ icon: Icon, title, date, venue, text, href, featured, slug }) => {
              const event = findEvent(slug);
              // The wide featured card uses the event's wide banner photo so it isn't stretched
              const photo = event ? (featured ? bannerImage(event) : cardImage(event)) : null;
              return (
              <Link
                key={title}
                href={href}
                className={`ignite-hud-bracket group relative flex flex-col border border-white/10 border-t-orange-500/70 rounded-sm p-6 hover:bg-white/[0.06] transition-colors overflow-hidden ${featured ? "lg:col-span-2 bg-orange-500/[0.06]" : "bg-white/[0.03]"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {photo && (
                  <div className="relative -mx-6 -mt-6 mb-6 h-40 overflow-hidden border-b border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      {...photo}
                      sizes={featured ? "(max-width: 1024px) 100vw, 760px" : "(max-width: 640px) 100vw, 380px"}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover opacity-75 saturate-[0.85] transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/20 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <Icon className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                  </div>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-orbitron font-bold tracking-widest">{date}</span>
                </div>
                <h3 className="font-orbitron font-bold text-lg tracking-wider mb-2">{title}</h3>
                <p className="text-sm text-slate-400">{text}</p>
                <p className="mt-3 flex items-center gap-1.5 font-hud text-xs font-semibold tracking-widest text-slate-300 uppercase">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> {venue}
                </p>
                <span className="mt-auto pt-6 flex items-center gap-1 font-hud text-xs tracking-widest text-orange-400/80 group-hover:text-orange-300">
                  VIEW DETAILS <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== SCHEDULE ===================== */}
      <section id="schedule" className="relative w-full py-24 px-6 md:px-20 border-t border-orange-500/20 bg-gradient-to-b from-[#07080c] to-[#020306]">
        <div className="max-w-4xl mx-auto">
          <SectionEyebrow>THE TIMELINE</SectionEyebrow>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-4 tracking-wider text-center">EVENT SCHEDULE</h2>
          <p className="ignite-pixel-dates text-center text-white/80 mb-16">12 - 15 OCTOBER &apos;26</p>

          <div className="space-y-12 relative before:absolute before:top-0 before:bottom-0 before:left-5 md:before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500/50 before:via-orange-400/50 before:to-transparent">
            {SCHEDULE.map((item) => (
              <div key={item.title} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-orange-500 bg-[#020306] shadow-[0_0_10px_rgba(249,115,22,0.5)] shrink-0 absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                </div>
                <Link href={item.href} className="ignite-hud-bracket block w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-6 border border-white/10 bg-white/[0.03] rounded-sm ml-auto md:ml-0 hover:border-orange-500/50 transition-colors">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-orbitron font-bold tracking-widest">{item.day}</span>
                    <span className="text-orange-400 text-xs font-hud font-semibold tracking-widest">{`${item.date} // ${item.time}`}</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMMITTEE ===================== */}
      <section id="team" className="relative w-full py-24 px-6 md:px-20 border-t border-orange-500/20 bg-[#050608]">
        <div className="max-w-6xl mx-auto">
          <SectionEyebrow>THE ARCHITECTS</SectionEyebrow>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-16 tracking-wider">ORGANIZING COMMITTEE</h2>

          <div className="space-y-24">
            {COMMITTEE.map((group) => (
              <div key={group.title}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-gradient-to-r from-orange-500/50 to-transparent flex-1" />
                  <h3 className="text-xl md:text-2xl font-orbitron font-bold tracking-widest uppercase text-center">{group.title}</h3>
                  <div className="h-px bg-gradient-to-l from-orange-500/50 to-transparent flex-1" />
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                  {group.members.map((member) => (
                    <div key={member.name} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
                      <CommitteeCard {...member} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== REGISTER ===================== */}
      <section id="register" className="relative w-full py-28 px-6 md:px-20 bg-black overflow-hidden border-t border-orange-500/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,#f97316,transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="relative w-[16rem] h-[16rem] md:w-[22rem] md:h-[22rem] -mb-6 md:-mb-8 z-20 pointer-events-none">
            <Image src="/robot.webp" alt="" fill sizes="(max-width: 768px) 256px, 352px" className="object-contain object-bottom" />
          </div>

          <div className="relative z-30 flex w-full flex-col items-center">
            {REGISTRATIONS_OPEN ? (
              <>
                <h2 className="font-orbitron font-black text-5xl md:text-[7rem] leading-none tracking-tighter mb-2 uppercase drop-shadow-2xl">
                  BOOK YOUR
                </h2>
                <h2 className="font-orbitron font-black text-5xl md:text-[7.5rem] leading-none tracking-tighter mb-12 uppercase drop-shadow-2xl">
                  <span>PASS </span>
                  <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]">NOW</span>
                </h2>
              </>
            ) : (
              <>
                <h2 className="sr-only">Registrations closed</h2>
                {/* Crossed "do not cross" tapes run across the whole section */}
                <div className="relative mb-6 mt-2 h-40 w-[130vw] max-w-none md:h-56" aria-hidden="true">
                  <CautionTape size="lg" tilt={5} reverse text="DO NOT CROSS" className="absolute inset-x-0 top-1/2 -translate-y-1/2" />
                  <CautionTape size="lg" tilt={-6} text="REGISTRATIONS CLOSED" className="absolute inset-x-0 top-1/2 -translate-y-1/2" />
                </div>
                <p className="mb-12 max-w-xl text-base text-slate-300 md:text-lg">
                  Registrations for every IEEE IGNITE &apos;26 event are now closed. The {PS_COUNT} hackathon problem statements are live.
                </p>
              </>
            )}
          </div>

          {/* Countdown to the opening ceremony */}
          <div className="relative z-30 mb-12">
            <p className="font-hud text-xs tracking-[0.35em] font-bold text-orange-500 mb-4">
              {countdown?.live ? "IGNITE IS LIVE" : "IGNITION SEQUENCE // T-MINUS"}
            </p>
            <div className="flex items-center justify-center gap-2 min-h-[5rem]">
              {countdown?.parts.map((t, i) => (
                <React.Fragment key={t.label}>
                  <div className="ignite-hud-bracket flex flex-col items-center justify-center w-16 h-20 md:w-20 md:h-24 border border-orange-500/40 bg-[#0a0500]/80 rounded-sm backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                    <span className="text-2xl md:text-4xl font-orbitron font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] tabular-nums">
                      {String(t.value).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-hud tracking-widest font-bold text-slate-400 mt-1">{t.label}</span>
                  </div>
                  {i < 3 && <span className="text-xl font-bold text-orange-500/50">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-30">
            <Link href={REGISTRATIONS_OPEN ? "/events" : PS_PAGE_PATH} className="ignite-btn-primary flex items-center gap-2 px-10 py-4 rounded-sm font-orbitron font-bold text-sm tracking-widest uppercase text-black">
              {REGISTRATIONS_OPEN ? "Register Now" : "Problem Statements"} <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/rulebooks" className="ignite-btn-secondary px-10 py-4 rounded-sm font-orbitron font-bold text-sm tracking-widest uppercase text-neutral-200">
              Rulebooks
            </Link>
            {/* Accounts are switched off for now (see _backend/README.md)
            {user ? (
              <Link href="/dashboard" className="ignite-btn-secondary px-10 py-4 rounded-sm font-orbitron font-bold text-sm tracking-widest uppercase text-neutral-200">
                My Pass &amp; QR
              </Link>
            ) : (
              <button onClick={openLogin} className="ignite-btn-secondary px-10 py-4 rounded-sm font-orbitron font-bold text-sm tracking-widest uppercase text-neutral-200">
                Login
              </button>
            )}
            */}
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="relative w-full py-10 px-6 md:px-20 border-t border-white/10 bg-[#020306]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity" aria-label="IEEE IGNITE '26 home">
            <Image src="/ignite-wordmark.png" alt="IEEE IGNITE" width={112} height={48} className="h-12 w-auto" />
            <span className="font-orbitron font-bold text-lg tracking-widest text-orange-500">&apos;26</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-6 font-hud text-xs font-bold tracking-widest text-slate-500 uppercase">
            <a href="#about" className="hover:text-orange-400 transition-colors">About</a>
            <a href="#schedule" className="hover:text-orange-400 transition-colors">Schedule</a>
            <Link href="/events" className="hover:text-orange-400 transition-colors">Events</Link>
            <Link href="/rulebooks" className="hover:text-orange-400 transition-colors">Rulebooks</Link>
            <Link href="/sponsors" className="hover:text-orange-400 transition-colors">Sponsors</Link>
          </nav>
          <p className="text-slate-600 font-mono text-[10px] tracking-wider">© 2026 IEEE STUDENT BRANCH // ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}
