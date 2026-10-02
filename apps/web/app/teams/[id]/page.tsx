"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Link as LinkIcon, Lock, Trophy } from "lucide-react";
import { getTeamDetails, submitProject } from "../../actions/submissions";

const LOCKED_STATES = ["LOCKED", "UNDER_REVIEW", "SCORED", "WINNER", "ARCHIVED"];

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-300",
  SUBMITTED: "bg-orange-500/15 text-orange-300",
  UNDER_REVIEW: "bg-amber-500/15 text-amber-300",
};

export default function TeamWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [problemId, setProblemId] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const applyTeamResult = (res: Awaited<ReturnType<typeof getTeamDetails>>) => {
    if (res.success && res.team) {
      setTeam(res.team);
      const current = res.team.submissions?.[0];
      if (current?.problemStatementId) setProblemId(current.problemStatementId);
    } else {
      setError(res.error || "Team not found");
    }
    setLoading(false);
  };

  const load = async () => applyTeamResult(await getTeamDetails(resolvedParams.id));

  useEffect(() => {
    let cancelled = false;
    getTeamDetails(resolvedParams.id).then((res) => { if (!cancelled) applyTeamResult(res); });
    return () => { cancelled = true; };
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!problemId || !repoUrl) {
      setNotice({ type: "error", text: "Problem statement and repository URL are required." });
      return;
    }

    setSubmitting(true);
    const res = await submitProject(resolvedParams.id, problemId, repoUrl, demoUrl);
    if (res.success) {
      setNotice({ type: "success", text: "Project submitted successfully!" });
      setRepoUrl("");
      setDemoUrl("");
      await load();
    } else {
      setNotice({ type: "error", text: res.error || "Failed to submit" });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="ignite-spinner" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <h1 className="ignite-title mb-3 text-3xl">Access Denied</h1>
        <p className="mb-8 text-slate-400">{error === "Unauthorized" ? "Please log in to open your team workspace." : "This team doesn't exist or you're not a member."}</p>
        <Link href="/teams" className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black">TEAM HQ</Link>
      </div>
    );
  }

  // Flatten problem statements for the dropdown
  const problemStatements = team.event?.hackathonTracks?.flatMap((t: any) => t.problemStatements) || [];
  const currentSubmission = team.submissions?.[0];
  const isLocked = LOCKED_STATES.includes(currentSubmission?.status);
  const latestVersion = currentSubmission?.versions?.slice().sort((a: any, b: any) => b.versionNumber - a.versionNumber)[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <Link href="/teams" className="mb-6 inline-flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-[0.25em] text-slate-400 transition-colors hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" /> Team HQ
      </Link>

      <div className="mb-10 border-b border-white/10 pb-6">
        <p className="ignite-eyebrow mb-2">Workspace // {team.event?.name}</p>
        <h1 className="ignite-title mb-2 text-4xl md:text-5xl">{team.name}</h1>
        <p className="text-slate-400">Status: <span className="font-bold text-white">{team.status}</span></p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="ignite-panel ignite-hud-bracket p-8">
            <div className="mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-orange-500" />
              <h2 className="ignite-title text-2xl">Project Submission</h2>
            </div>

            {isLocked ? (
              <div className="rounded-sm border border-white/10 bg-white/[0.03] p-8 text-center">
                <Lock className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                <h3 className="ignite-title mb-2 text-xl">Submission Locked</h3>
                <p className="text-slate-400">Your project has been locked for judging. Good luck!</p>
              </div>
            ) : problemStatements.length === 0 ? (
              <p className="text-slate-400">Problem statements for this hackathon haven&apos;t been published yet. Check back soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label htmlFor="ps" className="ignite-label">Problem Statement</label>
                  <select id="ps" value={problemId} onChange={e => setProblemId(e.target.value)} className="ignite-input disabled:opacity-70" required disabled={!!currentSubmission?.problemStatementId}>
                    <option value="">-- Select the problem you solved --</option>
                    {problemStatements.map((ps: any) => (
                      <option key={ps.id} value={ps.id}>{ps.title}</option>
                    ))}
                  </select>
                  {currentSubmission?.problemStatementId && (
                    <p className="mt-2 font-hud text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">Locked: a selected problem statement can&apos;t be changed</p>
                  )}
                </div>

                <div>
                  <label htmlFor="repo" className="ignite-label flex items-center gap-2"><Github className="h-4 w-4" /> Repository URL (required)</label>
                  <input id="repo" type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/your-username/repo" className="ignite-input" required />
                </div>

                <div>
                  <label htmlFor="demo" className="ignite-label flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Live Demo URL (optional)</label>
                  <input id="demo" type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://your-project.vercel.app" className="ignite-input" />
                </div>

                {notice && (
                  <div role={notice.type === "error" ? "alert" : "status"} className={`rounded-sm border p-3 text-sm ${notice.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}>
                    {notice.text}
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <button type="submit" disabled={submitting} className="ignite-btn-primary w-full rounded-sm py-4 font-orbitron text-lg font-bold tracking-wider text-black">
                    {submitting ? "UPLOADING..." : (currentSubmission ? "UPDATE SUBMISSION" : "SUBMIT PROJECT")}
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">Only the team leader can submit. You can update your submission until judging begins.</p>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="ignite-panel p-6">
            <h3 className="ignite-title mb-4 text-lg">Current Roster</h3>
            <div className="space-y-3">
              {team.members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{m.user.firstName}</span>
                  <span className={`font-hud text-xs font-bold tracking-widest ${m.role === "LEADER" ? "text-orange-400" : "text-slate-500"}`}>{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          {currentSubmission && (
            <div className="ignite-panel p-6">
              <h3 className="ignite-title mb-3 text-lg">Submission Status</h3>
              <span className={`inline-block rounded-sm px-3 py-1 font-orbitron text-xs font-bold ${STATUS_STYLES[currentSubmission.status] ?? "bg-emerald-500/15 text-emerald-400"}`}>
                {currentSubmission.status}
              </span>
              {latestVersion?.assets?.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  <p className="font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Version {latestVersion.versionNumber}</p>
                  {latestVersion.assets.map((a: any) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-sm text-orange-400 hover:text-orange-300">
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {a.type === "REPOSITORY" ? "Repository" : "Live demo"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
