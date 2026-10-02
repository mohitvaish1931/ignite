"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginUser } from "../actions/auth";

type LoginSuccess = Extract<Awaited<ReturnType<typeof loginUser>>, { success: true }>;

/** Sends the user to the dashboard their credentials belong to. */
export function goToDestination(result: LoginSuccess) {
  if (result.destination === "admin") {
    // Staff: hand the one-time pass to the admin app in a POST body (never in the URL)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = result.handoff.url;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "token";
    input.value = result.handoff.token;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    return;
  }
  window.location.href = result.redirectTo;
}

/** The single login form for participants, volunteers, organizers and admins. */
export default function LoginForm({ onForgot, onNavigate }: { onForgot: () => void; onNavigate?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "redirecting">("idle");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;
    setStatus("loading");
    const res = await loginUser(email, password);
    if (res.success) {
      setStatus("redirecting");
      goToDestination(res);
    } else {
      setError(res.error || "Login failed");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className="ignite-label">Email Address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="hacker@ignite.org"
          className="ignite-input"
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="ignite-label">Password</label>
          <button type="button" onClick={onForgot} className="mb-1.5 font-hud text-[11px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300">
            Forgot?
          </button>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="ignite-input"
          required
        />
      </div>
      {error && (
        <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400" role="alert">{error}</div>
      )}
      <button type="submit" disabled={status !== "idle"} className="ignite-btn-primary mt-2 w-full rounded-sm py-3 font-orbitron text-sm font-bold tracking-wider text-black">
        {status === "loading" ? "AUTHENTICATING..." : status === "redirecting" ? "ACCESS GRANTED..." : "AUTHENTICATE"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Participants, volunteers, organizers and admins all sign in here.
        <br />
        New here? <Link href="/events" onClick={onNavigate} className="text-orange-400 hover:text-orange-300">Register for an event</Link> to create your account.
      </p>
    </form>
  );
}
