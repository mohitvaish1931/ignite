"use client";

import React from "react";
import Link from "next/link";
import { useNavigation } from "../navigation/NavigationProvider";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { usePathname } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  ORGANIZER: "Organizer",
  VOLUNTEER: "Volunteer",
  JUDGE: "Judge",
  PARTICIPANT: "Participant",
};

// Phones get the compact icon rail so the page keeps most of the width
const SMALL_SCREEN = "(max-width: 767px)";
function useIsSmallScreen() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(SMALL_SCREEN);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(SMALL_SCREEN).matches,
    () => false
  );
}

export function Sidebar() {
  const { isSidebarOpen: sidebarPreference, filteredItems, user, activeRole } = useNavigation();
  const pathname = usePathname();
  const isSidebarOpen = sidebarPreference && !useIsSmallScreen();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login?signedout=1";
    }
  };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#06070b] border-r border-white/[0.07] shadow-2xl relative z-40 shrink-0"
    >
      <div className="flex items-center h-16 px-5 border-b border-white/[0.07] overflow-hidden bg-[#040508] shrink-0">
        <Link href="/" className="flex items-center gap-2 w-full" aria-label="Admin home">
          <img src="/ignite-wordmark.png" alt="IEEE IGNITE" className="w-auto h-9 max-w-[180px] object-contain shrink-0" />
          {isSidebarOpen && (
            <span className="rounded border border-orange-500/40 bg-orange-500/15 px-1.5 py-0.5 font-mono text-[10px] text-orange-400">ADMIN</span>
          )}
        </Link>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
          // Active if current path exactly matches href, or if it's a sub-route (excluding root /)
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative text-sm",
                isActive
                  ? "bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-300 font-semibold border border-orange-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 font-medium border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300")} />
              {isSidebarOpen && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-14 px-2 py-1 bg-[#11131a] text-slate-200 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Signed-in user */}
      <div className="p-4 border-t border-white/[0.07] bg-[#040508]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0 font-semibold text-orange-400 text-sm uppercase">
            {user?.email?.charAt(0) ?? <LucideIcons.User className="w-4 h-4" />}
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-200 truncate">{user?.email ?? "Not signed in"}</span>
              <span className="text-xs text-slate-500 truncate">{ROLE_LABELS[user?.role ?? activeRole] ?? activeRole}</span>
            </motion.div>
          )}
          {user && isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LucideIcons.LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
