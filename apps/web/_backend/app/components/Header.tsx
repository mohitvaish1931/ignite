"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getCurrentUser, logoutUser, requestPasswordReset } from "../actions/auth";
import LoginForm from "./LoginForm";
import { SkitLogo } from "./SkitLogo";

type HeaderUser = { firstName?: string | null; email: string; isJudge?: boolean } | null;

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Hackathons", href: "/hackathons" },
];

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ignite-panel ignite-hud-bracket w-full max-w-sm p-8 shadow-[0_0_60px_rgba(249,115,22,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 className="ignite-title mb-1 text-xl">{title}</h2>
        {subtitle && <p className="mb-6 text-xs text-slate-400">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [user, setUser] = useState<HeaderUser>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const [isForgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [resetting, setResetting] = useState(false);

  // The header lives in the root layout and survives client-side navigation, so
  // re-check on every route change (e.g. registering logs the user in, then redirects)
  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((res) => { if (!cancelled) setUser(res.success ? res.user : null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  // Close the mobile menu whenever the route changes
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    // Lets pages without this header's LOGIN button (e.g. the home page) open the modal
    const openLogin = () => setLoginModalOpen(true);
    const openForgot = () => setForgotModalOpen(true);
    window.addEventListener("ignite:open-login", openLogin);
    window.addEventListener("ignite:open-forgot", openForgot);
    return () => {
      window.removeEventListener("ignite:open-login", openLogin);
      window.removeEventListener("ignite:open-forgot", openForgot);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setResetLink("");
    if (!resetEmail) return;

    setResetting(true);
    const res = await requestPasswordReset(resetEmail);
    if (res.success) {
      setResetMessage(res.message || "Reset link generated.");
      if (res.resetLink) setResetLink(res.resetLink);
    } else {
      setResetMessage(res.error || "Failed to generate link.");
    }
    setResetting(false);
  };

  const userLinks = user
    ? [
        { label: "Teams", href: "/teams" },
        ...(user.isJudge ? [{ label: "Jury", href: "/jury" }] : []),
        { label: "Dashboard", href: "/dashboard" },
      ]
    : [];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    `relative py-1 transition-colors ${isActive(href) ? "text-orange-400 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-orange-500 after:shadow-[0_0_8px_#f97316]" : "text-slate-300 hover:text-orange-400"}`;

  return (
    <>
      {!isHomePage && (
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
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-sm bg-white/10" />
              ) : user ? (
                <>
                  <nav className="hidden items-center gap-6 md:flex">
                    {userLinks.map((link) => (
                      <Link key={link.href} href={link.href} className={linkClass(link.href)}>{link.label}</Link>
                    ))}
                  </nav>
                  <button onClick={handleLogout} className="hidden border-l border-white/10 pl-5 uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-red-400 md:inline">
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="ignite-btn-primary rounded-sm px-5 py-2 font-orbitron text-xs font-bold tracking-wider text-black"
                >
                  LOGIN
                </button>
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
                {[...PUBLIC_LINKS, ...userLinks].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-sm px-3 py-3 transition-colors ${isActive(link.href) ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-white/5 hover:text-orange-400"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <button onClick={handleLogout} className="rounded-sm px-3 py-3 text-left uppercase tracking-[0.2em] text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400">
                    Logout
                  </button>
                )}
              </div>
            </nav>
          )}
        </header>
      </>
      )}

      {isLoginModalOpen && (
        <Modal title="Access Portal" subtitle="One login for participants, volunteers, organizers and admins." onClose={() => setLoginModalOpen(false)}>
          <LoginForm
            onForgot={() => { setLoginModalOpen(false); setForgotModalOpen(true); }}
            onNavigate={() => setLoginModalOpen(false)}
          />
        </Modal>
      )}

      {isForgotModalOpen && (
        <Modal title="Reset Access" subtitle="Enter your registered email to receive a reset link." onClose={() => setForgotModalOpen(false)}>
          <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-email" className="ignite-label">Email Address</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="hacker@ignite.org"
                className="ignite-input"
                required
              />
            </div>
            {resetMessage && <div className="text-sm text-slate-300">{resetMessage}</div>}
            {resetLink && (
              <div className="rounded-sm border border-orange-500/30 bg-orange-500/10 p-3">
                <p className="mb-1 font-hud text-[10px] font-bold uppercase tracking-widest text-orange-400">Dev mode reset link:</p>
                <a href={resetLink} className="break-all text-xs text-white underline">{resetLink}</a>
              </div>
            )}
            <button type="submit" disabled={resetting} className="ignite-btn-primary mt-2 w-full rounded-sm py-3 font-orbitron text-sm font-bold tracking-wider text-black">
              {resetting ? "GENERATING..." : "REQUEST LINK"}
            </button>
            <button type="button" onClick={() => { setForgotModalOpen(false); setLoginModalOpen(true); }} className="font-hud text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white">
              Back to login
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
