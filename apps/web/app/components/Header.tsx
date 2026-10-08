"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SkitLogo } from "./SkitLogo";
import { HACKATHON_SLUG } from "../../lib/hackathon-rules";
import { REGISTRATIONS_OPEN } from "../../lib/events";
import { PS_PAGE_PATH } from "../../lib/problem-statements";

// Frontend only for now: registrations run on the SKIT ERP / official forms, so there is no
// login here. The full header with login, logout and account links is parked in
// _backend/app/components/Header.tsx (see _backend/README.md).

// The airlock on the Events page is the hackathon's main entry
const HACKATHON_ENTRY = "/events?tab=hackathons";

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Hackathons", href: HACKATHON_ENTRY },
  { label: "Rulebooks", href: "/rulebooks" },
];

/** The header link to light up; every hackathon page counts as Hackathons rather than Events. */
function activeHref(pathname: string, tab: string | null) {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/hackathons") || pathname === `/events/${HACKATHON_SLUG}` || (pathname === "/events" && tab === "hackathons")) return HACKATHON_ENTRY;
  return PUBLIC_LINKS.find((link) => link.href !== "/" && pathname.startsWith(link.href))?.href ?? null;
}

type LinkVariant = "bar" | "menu";

function NavLinkList({ variant, tab, onNavigate }: { variant: LinkVariant; tab: string | null; onNavigate?: () => void }) {
  const active = activeHref(usePathname(), tab);
  return PUBLIC_LINKS.map((link) => {
    const isActive = link.href === active;
    const className =
      variant === "bar"
        ? `relative py-1 transition-colors ${isActive ? "text-orange-400 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-orange-500 after:shadow-[0_0_8px_#f97316]" : "text-slate-300 hover:text-orange-400"}`
        : `rounded-sm px-3 py-3 transition-colors ${isActive ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-white/5 hover:text-orange-400"}`;
    return (
      <Link key={link.href} href={link.href} className={className} onClick={onNavigate}>
        {link.label}
      </Link>
    );
  });
}

function TabAwareNavLinks({ variant, onNavigate }: { variant: LinkVariant; onNavigate?: () => void }) {
  return <NavLinkList variant={variant} tab={useSearchParams().get("tab")} onNavigate={onNavigate} />;
}

/** The ?tab= query only exists in the browser on prerendered pages, so the tab-aware links sit in their own Suspense boundary. */
function NavLinks({ variant, onNavigate }: { variant: LinkVariant; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavLinkList variant={variant} tab={null} onNavigate={onNavigate} />}>
      <TabAwareNavLinks variant={variant} onNavigate={onNavigate} />
    </Suspense>
  );
}

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
            <NavLinks variant="bar" />
          </nav>

          <div className="ml-auto flex items-center gap-5 font-hud text-sm font-semibold uppercase tracking-[0.2em]">
            {REGISTRATIONS_OPEN ? (
              // Each event page links to its official registration form
              <Link href="/events" className="ignite-btn-primary rounded-sm px-5 py-2 font-orbitron text-xs font-bold tracking-wider text-black">
                REGISTER
              </Link>
            ) : (
              // Registrations are closed: the header highlights the problem statements instead
              <Link href={PS_PAGE_PATH} className="ignite-btn-primary flex items-center gap-2 whitespace-nowrap rounded-sm px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-black sm:px-5">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                </span>
                VIEW PS
              </Link>
            )}

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
              {/* Close on tap too: Events <-> Hackathons only changes the ?tab= query, not the path */}
              <NavLinks variant="menu" onNavigate={() => setMenuOpen(false)} />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
