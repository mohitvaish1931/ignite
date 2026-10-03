"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface CommitteeCardProps {
  name: string;
  role: string;
  imagePath?: string;
  authLevel?: string;
}

// How long a tapped card stays lit before it settles back
const PRESS_MS = 2500;

export default function CommitteeCard({ name, role, imagePath, authLevel = "ADMIN" }: CommitteeCardProps) {
  // Use a reliable pseudo-random hex for the visual flavor based on the name length to keep it consistent
  const hexCode = "0x" + Math.abs(name.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(16).toUpperCase().substring(0, 6).padStart(6, 'E');

  // Use pseudo-random coordinates
  const lat = Math.abs(name.charCodeAt(0) * 1.34).toFixed(2);
  const lng = Math.abs(name.charCodeAt(name.length - 1) * 2.17).toFixed(2);

  // Phones have no hover, so the card lights up while it crosses the middle of the screen,
  // and a tap lights it up (with a glitch burst) wherever it is
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !window.matchMedia("(hover: none)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pressed) return;
    const timer = setTimeout(() => setPressed(false), PRESS_MS);
    return () => clearTimeout(timer);
  }, [pressed, burst]);

  const handleTap = () => {
    setPressed(true);
    setBurst((n) => n + 1);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleTap}
      data-active={inView || pressed || undefined}
      className="relative group w-full max-w-[280px] aspect-[3/4] mx-auto cursor-pointer select-none transition-transform duration-200 active:scale-[0.97]"
    >

      {/* Outer Border Layer */}
      <div
        className="absolute inset-0 bg-white/10 card-on:bg-orange-500 transition-colors duration-500"
        style={{ clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)" }}
      >
        {/* Inner Content Layer */}
        <div
          className="absolute inset-[1px] md:inset-[2px] bg-[#0a0a0a] overflow-hidden"
          style={{ clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)" }}
        >

          {/* Main Image */}
          {imagePath ? (
            <Image
              src={imagePath}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 280px"
              className="object-cover grayscale card-on:grayscale-0 transition-all duration-700 ease-in-out opacity-60 card-on:opacity-100 scale-100 card-on:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-20 card-on:opacity-60 transition-opacity">
               {/* Fallback pattern */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
               <span className="font-orbitron font-black text-8xl text-white/10 uppercase drop-shadow-2xl">{name.charAt(0)}</span>
            </div>
          )}

          {/* Top HUD Overlay */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start font-manrope text-[8px] md:text-[9px] font-bold tracking-widest text-orange-500/70 card-on:text-orange-400 transition-colors z-10">
            <span>[AUTH_LEVEL: {authLevel}]</span>
            <span>{hexCode}</span>
          </div>

          {/* Dots on top HUD */}
          <div className="absolute top-4 left-2 w-1 h-1 bg-orange-500/50 card-on:bg-orange-400 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]" />

          {/* Bottom Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />

          {/* Cyberpunk Glitch & Scanner Overlay (on hover, or while lit on phones) */}
          <div className="absolute inset-0 opacity-0 card-on:opacity-100 transition-opacity duration-300 z-10 pointer-events-none overflow-hidden mask-image-b">

            {/* Binary / Tech Data Grid */}
            <div className="absolute inset-0 font-mono text-[5px] md:text-[6px] leading-tight text-orange-500/40 break-all select-none mix-blend-screen opacity-60">
              {Array.from({length: 150}).map(() => "01001010 11010011 00101101 10010011 ").join("")}
            </div>

            {/* Scanning Laser Line */}
            <div className="committee-scan absolute left-0 w-full h-[2px] bg-white shadow-[0_0_20px_5px_rgba(249,115,22,1)] z-20" />

            {/* CRT Scanline Overlay */}
            <div
              className="absolute inset-0 z-30 mix-blend-overlay opacity-50"
              style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.9) 2px, rgba(0,0,0,0.9) 4px)` }}
            />

            {/* Hexadecimal Grid Glitch */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.2)_0%,_transparent_70%)] mix-blend-screen card-on:animate-[committee-glitch_0.1s_linear_infinite]" />
          </div>

          {/* One-shot glitch burst on each tap/click; the key restarts it */}
          {burst > 0 && <div key={burst} className="committee-burst absolute inset-0 z-30 pointer-events-none" aria-hidden="true" />}

          {/* Bottom HUD / Info */}
          <div className="absolute bottom-0 left-0 w-full p-6 pb-8 flex flex-col items-center text-center z-20">
            <h3 className="font-orbitron font-black text-xl text-white tracking-widest mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] card-on:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all uppercase">
              {name}
            </h3>
            <p className="font-manrope text-[10px] tracking-[0.2em] text-orange-500/80 card-on:text-orange-400 font-bold uppercase transition-colors">
              {role}
            </p>
          </div>

          {/* Coordinates HUD at bottom left */}
          <div className="absolute bottom-2 left-2 font-orbitron text-[7px] text-white/30 tracking-widest z-20">
            {lat}°N {lng}°E
          </div>

          {/* Bottom right dot */}
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-orange-500/30 card-on:bg-orange-400 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)] transition-all z-20" />

        </div>
      </div>
    </div>
  );
}
