"use client";

import React from "react";
import { ShieldAlert, Shield } from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#050000] text-red-50 flex flex-col font-sans">
      {/* Super Admin Topbar */}
      <header className="border-b border-red-900/50 bg-[#100000] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest text-red-500">
            GOD MODE <span className="text-red-900 ml-2 text-sm">// SYSTEM ADMINISTRATION</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" /> Return to Standard Admin
          </Link>
          <div className="px-3 py-1 bg-red-950 border border-red-800 rounded-sm text-xs font-mono text-red-300">
            SUPER_ADMIN ACTIVE
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full relative">
        {/* Subtle grid background for aesthetic */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHBhdGggZD0iTTAgMGwyMCAwdjIwSDB6IiBmaWxsPSJub25lIi8+CgkJPHBhdGggZD0iTTAgMGwyMCAwdjFIMHptMCAxOWwyMCAwdjFIMHoiIGZpbGw9InJnYmEoMjU1LCAwLCAwLCAwLjAzKSIvPgoJCTxwYXRoIGQ9Ik0wIDBsdjIwSDFWMHpNMjAgMGwtMSAyMGgxdjIwSDIwVjB6IiBmaWxsPSJyZ2JhKDI1NSwgMCwgMCwgMC4wMykiLz4KPC9zdmc+')] pointer-events-none opacity-50 z-0" />
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
