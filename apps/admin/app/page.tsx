import Link from "next/link";
import { getDashboardStats } from "./actions/dashboard";
import { OverviewChart, UserGrowthChart } from "./components/DashboardCharts";
import { Calendar, Users, Code2, QrCode, ScanLine, ListChecks } from "lucide-react";

const STATE_STYLES: Record<string, { label: string; className: string }> = {
  LIVE: { label: "Live", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  REGISTRATION_OPEN: { label: "Registration Open", className: "text-orange-300 bg-orange-400/10 border-orange-400/20" },
  PUBLISHED: { label: "Upcoming", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  REGISTRATION_CLOSED: { label: "Reg. Closed", className: "text-slate-300 bg-slate-400/10 border-slate-400/20" },
  COMPLETED: { label: "Completed", className: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  DRAFT: { label: "Draft", className: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
};

const dateRange = (start: Date, end: Date) => {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
};

const stateBadge = (state: string) => STATE_STYLES[state] ?? { label: state.replace(/_/g, " ").toLowerCase(), className: "text-slate-400 bg-slate-400/10 border-slate-400/20" };

const QUICK_ACTIONS = [
  { label: "Create New Event", href: "/events/new", icon: Calendar, color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Add Hackathon", href: "/hackathons/new", icon: Code2, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Open QR Scanner", href: "/scanner", icon: ScanLine, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Check-in Logs", href: "/qr", icon: ListChecks, color: "text-orange-300", bg: "bg-orange-400/10" },
];

export default async function DashboardOverview() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p className="text-destructive font-medium">{result.error}</p>
        </div>
      </div>
    );
  }

  const { totalEvents, activeHackathons, totalParticipants, liveCheckins, chartData, userGrowthData, newUsers, recentHackathons, topEvents } = result.data;

  const stats = [
    { label: "Total Events", value: totalEvents, icon: Calendar, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Active Hackathons", value: activeHackathons, icon: Code2, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Total Users", value: totalParticipants, icon: Users, color: "text-orange-300", bg: "bg-orange-400/10 border-orange-400/20" },
    { label: "Checked In", value: liveCheckins, icon: QrCode, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Top Stats Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">{stat.label}</h3>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Registrations</h2>
            <span className="text-sm text-slate-400">Last 30 days</span>
          </div>
          <div className="h-64">
            <OverviewChart data={chartData} />
          </div>
        </div>

        {/* Recent Hackathons */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Recent Hackathons</h2>
            <Link href="/hackathons" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">View All</Link>
          </div>

          {recentHackathons.length === 0 ? (
            <p className="text-sm text-slate-500">No hackathons yet. <Link href="/hackathons/new" className="text-orange-400 hover:text-orange-300">Create one</Link>.</p>
          ) : (
            <div className="space-y-4">
              {recentHackathons.map((hack) => {
                const badge = stateBadge(hack.state);
                return (
                  <Link key={hack.id} href={`/events/${hack.id}`} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
                        <Code2 className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{hack.name}</p>
                        <p className="text-xs text-slate-500">{hack._count.registrations} Participants</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400 mb-1.5">{dateRange(hack.startAt, hack.endAt)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.className}`}>{badge.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Top Events */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Top Events</h2>
            <Link href="/events" className="text-sm text-orange-400 hover:text-orange-300">View All</Link>
          </div>
          {topEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No events yet.</p>
          ) : (
            <div className="space-y-5">
              {topEvents.map((ev) => {
                const badge = stateBadge(ev.state);
                return (
                  <Link key={ev.id} href={`/events/${ev.id}`} className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4 last:border-0 last:pb-0 group">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-orange-300 transition-colors">{ev.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{dateRange(ev.startAt, ev.endAt)} · {ev._count.registrations} registered</p>
                    </div>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${badge.className}`}>{badge.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">User Growth</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-100">{totalParticipants}</p>
                <span className="text-xs text-emerald-400">+{newUsers} in 30 days</span>
              </div>
            </div>
          </div>
          <div className="h-40">
            <UserGrowthChart data={userGrowthData} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-[#040508] hover:border-orange-500/50 hover:bg-white/[0.04] transition-all group text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bg} group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-slate-300">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
