"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../actions/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("No reset token provided.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, newPassword);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } else {
      setError(res.error || "Failed to reset password");
    }
    setLoading(false);
  };

  const shownError = error || (!token ? "No reset token provided. Please request a new link." : "");

  return (
    <div className="ignite-panel ignite-hud-bracket mx-4 w-full max-w-md p-8 shadow-[0_0_60px_rgba(249,115,22,0.12)] md:p-12">
      <div className="mb-8 flex flex-col items-center">
        <Image src="/ignite-logo.png" alt="IEEE IGNITE" width={165} height={112} priority className="mb-6 h-24 w-auto md:h-28" />
        <h1 className="ignite-title text-center text-2xl md:text-3xl">Reset Password</h1>
        <p className="mt-2 text-center font-hud text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Enter your new credentials
        </p>
      </div>

      {success ? (
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-6 text-center" role="status">
          <h2 className="mb-2 font-orbitron text-xl text-emerald-400">ACCESS RESTORED</h2>
          <p className="text-sm text-slate-300">Your password has been reset successfully. Redirecting you home...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="new-password" className="ignite-label">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="ignite-input"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="ignite-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="ignite-input"
              required
            />
          </div>

          {shownError && (
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
              {shownError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="ignite-btn-primary mt-2 w-full rounded-sm py-4 font-orbitron font-bold uppercase tracking-widest text-black"
          >
            {loading ? "PROCESSING..." : "UPDATE PASSWORD"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-2 font-hud text-xs font-bold uppercase tracking-[0.25em] text-slate-500 transition-colors hover:text-white"
          >
            Return to home
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-16 text-white">
      <React.Suspense fallback={<div className="ignite-spinner" />}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
