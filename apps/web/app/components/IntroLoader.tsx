"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { INTRO_SEEN_KEY } from "../../lib/intro";

// Launch-sequence intro shown over the home page on a visitor's first load of the session.
// It is pure CSS (see "Intro" in globals.css), so it plays from the first paint without waiting
// for JavaScript; this component only handles skipping, scroll locking and removing itself.
// The root layout hides it before paint for visitors who have already seen it this session.


// Decided once per page load: skip when this browser already saw the intro this session, or
// when it already played during this visit (e.g. coming back to Home from another page)
let skipIntro: boolean | null = null;
function shouldSkip() {
  if (skipIntro === null) {
    try {
      skipIntro = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch {
      skipIntro = false;
    }
  }
  return skipIntro;
}
const noSubscribe = () => () => {};

// Elliptical orbits as paths, so the satellites can follow them with <animateMotion>
const ORBITS = [
  { id: "ignite-orbit-a", rx: 300, ry: 92, tilt: -16, ring: "r1", sat: "#f97316", dur: "5.5s" },
  { id: "ignite-orbit-b", rx: 250, ry: 74, tilt: 24, ring: "r2", sat: "#f8fafc", dur: "4.2s" },
  { id: "ignite-orbit-c", rx: 205, ry: 118, tilt: -64, ring: "r3", sat: "#fbbf24", dur: "6.4s" },
];
const ellipsePath = (rx: number, ry: number) => `M ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0`;

export default function IntroLoader() {
  const skip = useSyncExternalStore(noSubscribe, shouldSkip, () => false);
  const [done, setDone] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const active = !skip && !done;

  useEffect(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Storage blocked: the intro simply plays again next time
    }
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = () => setSkipping(true);
    window.addEventListener("keydown", onKey);
    // Safety net if animationend never arrives. Background tabs don't run the animation, so the
    // timer only starts once the page is actually visible (otherwise it could cut the intro off)
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const armFallback = () => {
      if (document.hidden || fallback !== undefined) return;
      fallback = setTimeout(() => {
        skipIntro = true;
        setDone(true);
      }, 6000);
    };
    armFallback();
    document.addEventListener("visibilitychange", armFallback);
    return () => {
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", armFallback);
      clearTimeout(fallback);
    };
  }, [active]);

  if (!active) return null;

  const finish = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "ignite-intro-hide" && e.animationName !== "ignite-intro-fade") return;
    skipIntro = true;
    setDone(true);
  };

  return (
    <div className={`ignite-intro${skipping ? " is-skipping" : ""}`} aria-hidden="true" onClick={() => setSkipping(true)} onAnimationEnd={finish}>
      {/* The two halves that split open along the horizon to reveal the page */}
      <div className="ignite-intro-panel ignite-intro-panel-top" />
      <div className="ignite-intro-panel ignite-intro-panel-bottom" />
      <div className="ignite-intro-horizon" />

      <div className="ignite-intro-stage">
        <div className="ignite-intro-grid" />
        <div className="ignite-intro-stars" />
        <div className="ignite-intro-scan" />
        <span className="ignite-intro-corner tl" />
        <span className="ignite-intro-corner tr" />
        <span className="ignite-intro-corner bl" />
        <span className="ignite-intro-corner br" />

        <div className="ignite-intro-hud-top font-hud">
          <p className="ignite-intro-type">
            <span className="text-orange-400">SYS.BOOT</span>
            {" // IEEE IGNITE '26"}
          </p>
          <p className="ignite-intro-type ignite-intro-hud-right">SKIT JAIPUR · 26.82° N 75.86° E</p>
        </div>

        <div className="ignite-intro-core">
          <svg className="ignite-intro-orbits" viewBox="-320 -320 640 640">
            <defs>
              <filter id="ignite-intro-sat-glow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {ORBITS.map((o) => (
              <g key={o.id} transform={`rotate(${o.tilt})`}>
                <path id={o.id} d={ellipsePath(o.rx, o.ry)} pathLength={1} className={`ignite-intro-ring ${o.ring}`} />
                <circle r="4.5" fill={o.sat} filter="url(#ignite-intro-sat-glow)" className="ignite-intro-sat">
                  <animateMotion dur={o.dur} repeatCount="indefinite">
                    <mpath href={`#${o.id}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}
          </svg>
          <div className="ignite-intro-glow" />
          <div className="ignite-intro-logo">
            <Image src="/ignite-wordmark.png" alt="" width={560} height={240} priority sizes="(max-width: 680px) 78vw, 520px" />
            {/* Launch: a beam from the rocket in the "I" and a flash at its base */}
            <span className="ignite-intro-beam" />
            <span className="ignite-intro-flash" />
          </div>
        </div>

        <div className="ignite-intro-hud-bottom font-hud">
          <div className="ignite-intro-status text-xs font-bold uppercase tracking-[0.35em] text-slate-300">
            <span>Calibrating orbits</span>
            <span>Fuelling the rocket</span>
            <span>Ignition</span>
          </div>
          <div className="ignite-intro-progress">
            <div className="ignite-intro-bar" />
          </div>
          <div className="mt-2 flex items-center justify-between font-orbitron text-[10px] font-bold tracking-[0.3em] text-slate-400">
            <span>LAUNCH SEQUENCE</span>
            <span className="ignite-intro-pct text-orange-400" />
          </div>
          <p className="ignite-intro-skip">CLICK OR PRESS ANY KEY TO SKIP</p>
        </div>
      </div>
    </div>
  );
}
