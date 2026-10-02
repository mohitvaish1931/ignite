"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerForEvent, joinTeamWithCode } from "../actions/registration";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  initialMode?: "register" | "join";
  /** Events with a rulebook require agreeing to it before registering. */
  agreement?: { href: string; detail: string };
  /** Only current students may register (hides "Graduated"). */
  studentsOnly?: boolean;
}

export function RegistrationModal({ isOpen, onClose, eventId, eventName, initialMode = "register", agreement, studentsOnly = false }: RegistrationModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "join">(initialMode);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    year: "1st Year",
    degree: "",
    joinCode: ""
  });

  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // The modal stays mounted between openings, so reset it to the button that opened it
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setMode(initialMode);
      setAgreed(false);
      setStatus("idle");
      setErrorMessage("");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agreement && !agreed) {
      setStatus("error");
      setErrorMessage("Please confirm you have read and agree to the rulebook.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    let res;
    if (mode === "join") {
      if (!formData.joinCode || formData.joinCode.length !== 6) {
        setStatus("error");
        setErrorMessage("Please enter the 6-character team token.");
        return;
      }
      res = await joinTeamWithCode(eventId, formData.joinCode, formData);
    } else {
      res = await registerForEvent(eventId, formData);
    }

    if (res.success) {
      setStatus("success");
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 2000);
    } else {
      setStatus("error");
      setErrorMessage(res.error || "Something went wrong");
    }
  };

  const inputClass = "ignite-input py-2.5";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          role="dialog"
          aria-modal="true"
          aria-label={mode === "join" ? "Join a team" : "Register now"}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="ignite-panel ignite-hud-bracket relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.12)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-6">
            <h2 className="ignite-title text-xl">
              {mode === "join" ? "Join a Team" : "Register Now"}
            </h2>
            <button onClick={onClose} className="text-slate-400 transition-colors hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            <p className="mb-6 text-sm text-slate-400">
              You are registering for <strong className="text-white">{eventName}</strong>.
              {mode === "register" ? " Fill out your details below." : " Enter your 6-character team token and your details to join."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "join" && (
                <div>
                  <label htmlFor="reg-token" className="ignite-label">Team Token</label>
                  <input
                    id="reg-token"
                    required
                    type="text"
                    maxLength={6}
                    value={formData.joinCode}
                    onChange={e => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. A1B2C3"
                    className={`${inputClass} border-orange-500/30 font-mono uppercase tracking-[0.3em]`}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="reg-name" className="ignite-label">Full Name</label>
                  <input id="reg-name" required type="text" autoComplete="name" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="John Doe" />
                </div>

                <div className="col-span-2">
                  <label htmlFor="reg-email" className="ignite-label">Email</label>
                  <input id="reg-email" required type="email" autoComplete="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
                </div>

                <div className="col-span-2">
                  <label htmlFor="reg-password" className="ignite-label">Password</label>
                  <input id="reg-password" required type="password" autoComplete="new-password" minLength={8} value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })} className={inputClass}
                    placeholder="New password (8+ chars) or your existing one" />
                </div>

                <div className="col-span-2">
                  <label htmlFor="reg-university" className="ignite-label">University / College</label>
                  <input id="reg-university" required type="text" value={formData.university}
                    onChange={e => setFormData({ ...formData, university: e.target.value })} className={inputClass} placeholder="Your college" />
                </div>

                <div>
                  <label htmlFor="reg-degree" className="ignite-label">Degree</label>
                  <input id="reg-degree" required type="text" value={formData.degree}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })} className={inputClass} placeholder="B.Tech CS" />
                </div>

                <div>
                  <label htmlFor="reg-year" className="ignite-label">Year</label>
                  <select id="reg-year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className={`${inputClass} appearance-none`}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    {/* Student-only events (per their rulebook) can't take graduates */}
                    {!studentsOnly && <option value="Graduated">Graduated</option>}
                  </select>
                </div>
              </div>

              {agreement && (
                <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link href={agreement.href} target="_blank" className="font-semibold text-orange-400 hover:underline">
                      {eventName} rulebook
                    </Link>
                    , {agreement.detail}.
                  </span>
                </label>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400" role="status">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p>Success! Redirecting to your dashboard...</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`mt-6 w-full rounded-sm py-3 font-orbitron font-bold tracking-wider transition-all ${
                  status === "success" ? "bg-emerald-500 text-white" : "ignite-btn-primary text-black"
                }`}
              >
                {status === "loading" ? "PROCESSING..." : 
                 status === "success" ? "SUCCESS!" : 
                 mode === "join" ? "JOIN TEAM" : "COMPLETE REGISTRATION"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-6 text-center">
              <button 
                onClick={() => setMode(mode === "register" ? "join" : "register")}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-orange-400"
              >
                {mode === "register" ? "Have a team token? Join a team instead." : "Don't have a token? Register individually."}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
