"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "../navigation/NavigationProvider";
import { Search, Command, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../ui/button";

export function Topbar() {
  const { isSidebarOpen, setSidebarOpen, navigationItems } = useNavigation();
  const pathname = usePathname();

  // Title of the deepest navigation item that matches the current route
  const current = [...navigationItems]
    .filter((item) => pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const title = current?.label ?? "Dashboard";

  const openCommandPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true }));
  };

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#040508]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="hidden md:inline-flex text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] w-9 h-9 rounded-md"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </Button>
        <h1 className="truncate text-base font-semibold text-slate-100 md:text-xl">{title}</h1>
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/[0.04] rounded-full border border-white/10 text-sm text-slate-500 w-72 hover:bg-white/[0.07] hover:border-orange-500/30 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search anything...</span>
        <span className="ml-auto flex items-center gap-1 bg-[#040508] px-1.5 py-0.5 rounded border border-white/10">
          <Command className="w-3 h-3" />
          <span className="text-[10px] font-mono font-bold">K</span>
        </span>
      </button>
    </header>
  );
}
