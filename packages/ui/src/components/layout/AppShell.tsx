"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../navigation/CommandPalette";

// Pages that render on their own, without the admin chrome
const BARE_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.includes(pathname)) {
    return <div className="h-dvh w-full overflow-y-auto bg-[#030408] text-slate-200 font-sans">{children}</div>;
  }

  return (
    <div className="flex h-dvh w-full bg-[#040508] text-slate-200 overflow-hidden font-sans">
      <CommandPalette />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden relative">
        <Topbar />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
