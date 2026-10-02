"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Starfield from "./Starfield";

/**
 * Fixed cosmic backdrop for inner pages: starfield, warm ignition glows and a faint
 * coordinate grid, matching the IEEE IGNITE '26 hero. The home page draws its own.
 */
export default function SpaceBackdrop() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030408] pointer-events-none print:hidden" aria-hidden="true">
      <Starfield count={90} />
      <div className="absolute -top-40 left-[15%] w-[640px] h-[640px] rounded-full bg-orange-600/10 blur-[140px]" />
      <div className="absolute -bottom-48 right-[10%] w-[560px] h-[560px] rounded-full bg-amber-500/[0.07] blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]" />
    </div>
  );
}
