import React from "react";
import { Eye, UserPlus, Users, Activity, ArrowUpRight } from "lucide-react";
import { RegistrationsChart, SourceChart, DemographicsChart } from "../components/AnalyticsCharts";
import { getDashboardStats } from "../actions/dashboard";

export default async function AnalyticsPage() {
  const result = await getDashboardStats();
  const stats = result.success && result.data ? result.data : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Analytics
        </h1>
        <div className="flex items-center gap-2">
           <select className="bg-white/[0.06] border border-white/10 text-slate-300 text-sm rounded-lg px-4 py-2 outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Views */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Eye className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Total Views</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">12.4K</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 16.7%
              </span>
            </div>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <UserPlus className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Total Registrations</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">{stats?.totalParticipants || 0}</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 11.3%
              </span>
            </div>
          </div>
        </div>

        {/* Unique Users */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Unique Users</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">{stats?.totalParticipants || 0}</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 8.2%
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Conversion Rate</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">18.6%</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 2.4%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Registrations Over Time */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Registrations Over Time</h2>
          </div>
          <RegistrationsChart data={stats?.chartData} />
        </div>

        {/* Registrations by Source */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-100">Registrations by Source</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center relative">
            <SourceChart />
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#f97316]"></div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Website</span>
                  <span className="text-xs font-semibold text-slate-200">45%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#3b82f6]"></div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Social Media</span>
                  <span className="text-xs font-semibold text-slate-200">30%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#10b981]"></div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Email</span>
                  <span className="text-xs font-semibold text-slate-200">15%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#64748b]"></div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Other</span>
                  <span className="text-xs font-semibold text-slate-200">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Events Performance */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Top Events by Registrations</h2>
          <div className="space-y-5">
            {[
              { name: "CodeStorm 2026", regs: "1,250" },
              { name: "AI Innovate", regs: "850" },
              { name: "HackTheFuture", regs: "640" },
              { name: "BuildForBharat", regs: "520" },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/[0.07] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{i + 1}.</span>
                  <p className="text-sm font-medium text-slate-200">{ev.name}</p>
                </div>
                <span className="text-sm font-semibold text-orange-400">{ev.regs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics */}
        <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#07080d] shadow-lg flex flex-col">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">User Demographics (Age)</h2>
          <div className="flex-1">
             <DemographicsChart />
          </div>
        </div>
      </div>
    </div>
  );
}
