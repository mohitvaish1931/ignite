import React from 'react';
import Image from 'next/image';

interface CommitteeCardProps {
  name: string;
  role: string;
  imagePath?: string;
  authLevel?: string;
}

export default function CommitteeCard({ name, role, imagePath, authLevel = "ADMIN" }: CommitteeCardProps) {
  // Use a reliable pseudo-random hex for the visual flavor based on the name length to keep it consistent
  const hexCode = "0x" + Math.abs(name.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(16).toUpperCase().substring(0, 6).padStart(6, 'E');
  
  // Use pseudo-random coordinates
  const lat = Math.abs(name.charCodeAt(0) * 1.34).toFixed(2);
  const lng = Math.abs(name.charCodeAt(name.length - 1) * 2.17).toFixed(2);

  return (
    <>
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(50000%); } /* High percentage to sweep down the entire card */
        }
        @keyframes cyber-glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 1px) }
          40% { transform: translate(-1px, -1px) }
          60% { transform: translate(2px, 1px) }
          80% { transform: translate(1px, -1px) }
          100% { transform: translate(0) }
        }
      `}</style>
      <div className="relative group w-full max-w-[280px] aspect-[3/4] mx-auto cursor-pointer">
      
      {/* Outer Border Layer */}
      <div 
        className="absolute inset-0 bg-white/10 group-hover:bg-orange-500 transition-colors duration-500"
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
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out opacity-60 group-hover:opacity-100 scale-100 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-20 group-hover:opacity-60 transition-opacity">
               {/* Fallback pattern */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
               <span className="font-orbitron font-black text-8xl text-white/10 uppercase drop-shadow-2xl">{name.charAt(0)}</span>
            </div>
          )}

          {/* Top HUD Overlay */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start font-manrope text-[8px] md:text-[9px] font-bold tracking-widest text-orange-500/70 group-hover:text-orange-400 transition-colors z-10">
            <span>[AUTH_LEVEL: {authLevel}]</span>
            <span>{hexCode}</span>
          </div>

          {/* Dots on top HUD */}
          <div className="absolute top-4 left-2 w-1 h-1 bg-orange-500/50 group-hover:bg-orange-400 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
          
          {/* Bottom Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />

          {/* Cyberpunk Glitch & Scanner Overlay (Visible on Hover) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none overflow-hidden mask-image-b">
            
            {/* Binary / Tech Data Grid */}
            <div className="absolute inset-0 font-mono text-[5px] md:text-[6px] leading-tight text-orange-500/40 break-all select-none mix-blend-screen opacity-60">
              {Array.from({length: 150}).map(() => "01001010 11010011 00101101 10010011 ").join("")}
            </div>

            {/* Scanning Laser Line */}
            <div 
              className="absolute top-0 left-0 w-full h-[2px] bg-white shadow-[0_0_20px_5px_rgba(249,115,22,1)] z-20"
              style={{ animation: 'scanline 3s linear infinite' }}
            />

            {/* CRT Scanline Overlay */}
            <div 
              className="absolute inset-0 z-30 mix-blend-overlay opacity-50"
              style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.9) 2px, rgba(0,0,0,0.9) 4px)` }}
            />
            
            {/* Hexadecimal Grid Glitch */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.2)_0%,_transparent_70%)] mix-blend-screen group-hover:animate-[cyber-glitch_0.1s_linear_infinite]" />
          </div>

          {/* Bottom HUD / Info */}
          <div className="absolute bottom-0 left-0 w-full p-6 pb-8 flex flex-col items-center text-center z-20">
            <h3 className="font-orbitron font-black text-xl text-white tracking-widest mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all uppercase">
              {name}
            </h3>
            <p className="font-manrope text-[10px] tracking-[0.2em] text-orange-500/80 group-hover:text-orange-400 font-bold uppercase transition-colors">
              {role}
            </p>
          </div>

          {/* Coordinates HUD at bottom left */}
          <div className="absolute bottom-2 left-2 font-orbitron text-[7px] text-white/30 tracking-widest z-20">
            {lat}°N {lng}°E
          </div>
          
          {/* Bottom right dot */}
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-orange-500/30 group-hover:bg-orange-400 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)] transition-all z-20" />

        </div>
      </div>
    </div>
    </>
  );
}
