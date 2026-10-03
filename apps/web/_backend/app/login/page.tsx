"use client";

import React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import LoginForm from "../components/LoginForm";

const ERRORS: Record<string, string> = {
  expired: "Your admin access link expired. Please log in again.",
  unauthorized: "That account can't open the admin panel.",
  signedout: "You have been signed out of the admin panel.",
};

function LoginNotice() {
  const reason = useSearchParams().get("error");
  if (!reason || !ERRORS[reason]) return null;
  return (
    <div className="mb-6 rounded-sm border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300" role="status">
      {ERRORS[reason]}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-16 text-white">
      <div className="ignite-panel ignite-hud-bracket w-full max-w-md p-8 shadow-[0_0_60px_rgba(249,115,22,0.12)] md:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/ignite-logo.png" alt="IEEE IGNITE" width={165} height={112} priority className="mb-6 h-24 w-auto md:h-28" />
          <h1 className="ignite-title text-2xl md:text-3xl">Access Portal</h1>
          <p className="mt-2 font-hud text-xs font-bold uppercase tracking-[0.25em] text-slate-400">One login for every IGNITE account</p>
        </div>
        <React.Suspense fallback={null}>
          <LoginNotice />
        </React.Suspense>
        <LoginForm onForgot={() => window.dispatchEvent(new Event("ignite:open-forgot"))} />
      </div>
    </div>
  );
}
