"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SkitLogo } from "./SkitLogo";

// Frontend only for now: registrations run on the SKIT ERP / official forms, so there is no
// login here. The full header with login, logout and account links is parked in
// _backend/app/components/Header.tsx (see _backend/README.md).

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Hackathons", href: "/hackathons" },
  { label: "Rulebooks", href: "/rulebooks" },
];

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    `relative py-1 transition-colors ${isActive(href) ? "text-orange-400 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-orange-500 after:shadow-[0_0_8px_#f97316]" : "text-slate-300 hover:text-orange-400"}`;

  // The home page draws its own header inside the hero
  if (isHomePage) return null;

  return (
    <>
      {/* Spacer to push content down below the fixed header */}
      <div className="h-16 w-full shrink-0 md:h-20 print:hidden" />
      <header className="fixed left-0 right-0 top-0 z-40 print:hidden border-b border-white/10 bg-[#030408]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-8 md:h-20">
          <div className="flex shrink-0 items-center gap-3">
            <SkitLogo priority className="h-9 w-auto md:h-11" />
            <span className="h-8 w-px bg-white/15" aria-hidden="true" />
            <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="IEEE IGNITE '26 home">
              <Image src="/ignite-wordmark.png" alt="IEEE IGNITE" width={112} height={48} priority className="h-10 w-auto md:h-12" />
              <span className="hidden whitespace-nowrap rounded border border-orange-500/40 bg-orange-500/20 px-1.5 py-0.5 font-mono text-[10px] text-orange-400 sm:inline">&apos;26</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 font-hud text-sm font-semibold uppercase tracking-[0.2em] lg:flex">
            {PUBLIC_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>{link.label}</Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5 font-hud text-sm font-semibold uppercase tracking-[0.2em]">
            {/* Each event page links to its official registration form */}
            <Link href="/events" className="ignite-btn-primary rounded-sm px-5 py-2 font-orbitron text-xs font-bold tracking-wider text-black">
              REGISTER
            </Link>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 text-slate-300 transition-colors hover:border-orange-500/50 hover:text-orange-400 lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu */}
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#030408]/95 px-4 py-4 font-hud text-sm font-semibold uppercase tracking-[0.2em] lg:hidden">
            <div className="flex flex-col gap-1">
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm px-3 py-3 transition-colors ${isActive(link.href) ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-white/5 hover:text-orange-400"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
