import React from "react";
import { Search, Plus, MoreVertical, Building2 } from "lucide-react";

import { getAdminOrganizers } from "../actions/organizers";

export default async function OrganizersPage() {
  const result = await getAdminOrganizers();
  const organizers = result.success && result.data ? result.data : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Organizers
        </h1>
      </div>

      <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search organizers..." 
              className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <a href="/organizers/new" className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Organizer
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#07080d]">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Events</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hackathons</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined On</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {organizers.map((org, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                        {org.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{org.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{org.events}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{org.hackathons}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{org.joined}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      org.status === 'Active' 
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                        : 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-slate-500 hover:text-slate-300 p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/[0.07] flex items-center justify-between bg-black/40 text-sm text-slate-400">
          <span>Showing 1 to 7 of 14 results</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">&lt;</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-600 text-white font-medium">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
