"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Mail, Plus, Shield, Trophy, User, Users, X } from "lucide-react";
import { getMyTeams, createTeam, inviteTeamMember } from "../actions/teams";
import { getPublicEvents } from "../actions/events";
import { MAX_TEAM_SIZE, RULEBOOK_PATH } from "../../lib/hackathon-rules";

type Notice = { type: "success" | "error"; text: string } | null;

function NoticeBar({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div
      role={notice.type === "error" ? "alert" : "status"}
      className={`rounded-sm border p-3 text-sm ${notice.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}
    >
      {notice.text}
    </div>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newEventId, setNewEventId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState<Notice>(null);

  const [inviteEmails, setInviteEmails] = useState<{ [teamId: string]: string }>({});
  const [inviteNotices, setInviteNotices] = useState<{ [teamId: string]: Notice }>({});
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const applyTeams = (res: Awaited<ReturnType<typeof getMyTeams>>) => {
    if (res.success) setTeams(res.teams || []);
    else setLoggedIn(false);
  };

  const loadTeams = async () => applyTeams(await getMyTeams());

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyTeams(), getPublicEvents({ hackathonsOnly: true })])
      .then(([teamsRes, eventsRes]) => {
        if (cancelled) return;
        applyTeams(teamsRes);
        if (eventsRes.success) setEvents(eventsRes.data || []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventId || !newTeamName.trim()) return;
    setCreating(true);
    setCreateNotice(null);
    const res = await createTeam(newEventId, newTeamName);
    if (res.success) {
      setCreateModalOpen(false);
      setNewEventId("");
      setNewTeamName("");
      await loadTeams();
    } else {
      setCreateNotice({ type: "error", text: res.error || "Failed to create team" });
    }
    setCreating(false);
  };

  const handleInvite = async (teamId: string) => {
    const email = inviteEmails[teamId]?.trim();
    if (!email) return;
    const res = await inviteTeamMember(teamId, email);
    if (res.success) {
      setInviteEmails({ ...inviteEmails, [teamId]: "" });
      setInviteNotices({ ...inviteNotices, [teamId]: { type: "success", text: `Invite recorded for ${email}. Share your team token so they can join.` } });
      await loadTeams();
    } else {
      setInviteNotices({ ...inviteNotices, [teamId]: { type: "error", text: res.error || "Failed to send invite" } });
    }
  };

  const copyToken = async (teamId: string, token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedTeamId(teamId);
      setTimeout(() => setCopiedTeamId((id) => (id === teamId ? null : id)), 2000);
    } catch {
      // Clipboard can be unavailable on insecure origins; the token is visible anyway
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="ignite-spinner" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-24 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-slate-700" />
        <h1 className="ignite-title mb-3 text-3xl">Team <span className="text-orange-500">HQ</span></h1>
        <p className="mb-8 text-slate-400">Log in to create a team, invite members and submit your project.</p>
        <button
          onClick={() => window.dispatchEvent(new Event("ignite:open-login"))}
          className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black"
        >
          LOGIN
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
        <div>
          <p className="ignite-eyebrow mb-3"><span className="text-orange-500/60">{"////"}</span> Hackathon Squads</p>
          <h1 className="ignite-title mb-3 text-4xl md:text-5xl">
            Team <span className="text-orange-500">HQ</span>
          </h1>
          <p className="text-lg text-slate-400">Manage your hackathon teams, recruit members, and prepare for glory.</p>
        </div>
        <button
          onClick={() => { setCreateNotice(null); setCreateModalOpen(true); }}
          className="ignite-btn-primary flex items-center gap-2 rounded-sm px-6 py-3 font-orbitron text-sm font-bold tracking-wider text-black"
        >
          <Plus className="h-4 w-4" /> NEW TEAM
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="ignite-panel border-dashed px-6 py-20 text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-slate-700" />
          <h3 className="ignite-title mb-2 text-2xl">No Teams Yet</h3>
          <p className="mx-auto mb-6 max-w-md text-slate-400">
            You haven&apos;t joined or created any teams. Create one for an upcoming hackathon, or join with a team token from an event page.
          </p>
          <button
            onClick={() => { setCreateNotice(null); setCreateModalOpen(true); }}
            className="ignite-btn-secondary rounded-sm px-6 py-2.5 font-orbitron text-sm font-bold tracking-wider text-neutral-200"
          >
            CREATE TEAM
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {teams.map((team) => (
            <div key={team.id} className="ignite-panel ignite-hud-bracket overflow-hidden p-6">
              <div className="absolute right-0 top-0 max-w-[60%] truncate rounded-bl-sm border-b border-l border-orange-500/30 bg-orange-500/10 px-4 py-2 font-orbitron text-xs font-bold text-orange-400">
                {team.event?.name}
              </div>

              <h2 className="mb-2 mt-6 font-orbitron text-2xl font-bold text-white">{team.name}</h2>
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-sm border border-white/10 bg-white/5 px-2.5 py-1 font-hud text-xs font-bold tracking-widest text-slate-300">
                  STATUS: {team.status}
                </span>
                {team.joinCode && (
                  <button
                    onClick={() => copyToken(team.id, team.joinCode)}
                    className="flex items-center gap-2 rounded-sm border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-orange-400 transition-colors hover:bg-orange-500/20"
                    title="Copy team token"
                  >
                    TOKEN: {team.joinCode}
                    {copiedTeamId === team.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="mb-3 flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  <Users className="h-4 w-4" /> Current Roster
                  <span className="ml-auto text-orange-400">{team.members.length}/{MAX_TEAM_SIZE}</span>
                </h4>
                <div className="space-y-3">
                  {team.members.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between rounded-sm border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{m.user.firstName}</p>
                          <p className="truncate text-xs text-slate-400">{m.user.email}</p>
                        </div>
                      </div>
                      {m.role === "LEADER" && <Shield className="h-4 w-4 shrink-0 text-orange-400" aria-label="Team leader" />}
                    </div>
                  ))}
                </div>
              </div>

              {team.invites && team.invites.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-hud text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pending Invites</h4>
                  <div className="space-y-2">
                    {team.invites.map((inv: any) => (
                      <div key={inv.id} className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail className="h-3 w-3" /> {inv.email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/teams/${team.id}`}
                className="block w-full rounded-sm border border-orange-500/30 bg-orange-500/10 py-3 text-center font-orbitron text-sm font-bold tracking-wider text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                ENTER WORKSPACE
              </Link>

              {team.members.length + (team.invites?.length ?? 0) >= MAX_TEAM_SIZE ? (
                <p className="mt-6 border-t border-white/10 pt-6 text-sm text-slate-400">
                  Squad full: teams can have at most {MAX_TEAM_SIZE} members, counting pending invites (
                  <Link href={`${RULEBOOK_PATH}#team-formation`} className="text-orange-400 hover:underline">rulebook §2</Link>).
                </p>
              ) : (
              <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                <label htmlFor={`invite-${team.id}`} className="ignite-label">Recruit Member</label>
                <p className="text-xs text-slate-500">All members must be from your institution and campus.</p>
                <div className="flex gap-2">
                  <input
                    id={`invite-${team.id}`}
                    type="email"
                    placeholder="hacker@email.com"
                    value={inviteEmails[team.id] || ""}
                    onChange={e => setInviteEmails({ ...inviteEmails, [team.id]: e.target.value })}
                    className="ignite-input min-w-0 flex-1 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleInvite(team.id)}
                    className="ignite-btn-secondary shrink-0 rounded-sm px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-neutral-200"
                  >
                    INVITE
                  </button>
                </div>
                <NoticeBar notice={inviteNotices[team.id] ?? null} />
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create team modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Create new team" className="ignite-panel ignite-hud-bracket w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setCreateModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h2 className="ignite-title mb-6 text-2xl">Create New Team</h2>
            {events.length === 0 ? (
              <p className="text-slate-400">No hackathons are open for teams right now. Check back soon!</p>
            ) : (
              <form onSubmit={handleCreateTeam} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="team-event" className="ignite-label">Select Hackathon</label>
                  <select id="team-event" value={newEventId} onChange={e => setNewEventId(e.target.value)} className="ignite-input" required>
                    <option value="">-- Choose Hackathon --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="team-name" className="ignite-label">Team Name</label>
                  <input id="team-name" type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Cyber Ninjas" className="ignite-input" required />
                </div>
                <NoticeBar notice={createNotice} />
                <button type="submit" disabled={creating} className="ignite-btn-primary mt-2 w-full rounded-sm py-3 font-orbitron font-bold tracking-wider text-black">
                  {creating ? "INITIALIZING..." : "INITIALIZE TEAM"}
                </button>
                <p className="text-center text-xs text-slate-500">You&apos;ll be registered for the hackathon automatically as team leader.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
