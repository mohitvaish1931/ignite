"use client";

import React, { useEffect, useState } from "react";
import { getUsersAndRoles, assignRoleToUser, revokeRoleFromUser } from "../actions/superadmin";
import { ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react";

export default function SuperAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null); // userId being processed

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await getUsersAndRoles();
    if (res.success && res.users) {
      setUsers(res.users);
      setAvailableRoles(res.availableRoles || []);
    }
    setLoading(false);
  }

  const handleAssign = async (userId: string, roleId: string) => {
    if (!roleId) return;
    setProcessing(userId);
    const res = await assignRoleToUser(userId, roleId);
    if (res.success) {
      await load();
    } else {
      alert(res.error || "Failed to assign role");
    }
    setProcessing(null);
  };

  const handleRevoke = async (userId: string, roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to revoke the ${roleName} role?`)) return;
    
    setProcessing(userId);
    const res = await revokeRoleFromUser(userId, roleId);
    if (res.success) {
      await load();
    } else {
      alert(res.error || "Failed to revoke role");
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-2">ACCESS CONTROL</h2>
        <p className="text-red-400">Manage system-wide permissions and user roles across all organizations.</p>
      </div>

      <div className="bg-[#0f0000] border border-red-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-950/30 border-b border-red-900/50">
                <th className="p-4 text-xs font-bold text-red-300 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-bold text-red-300 uppercase tracking-wider">Current Roles</th>
                <th className="p-4 text-xs font-bold text-red-300 uppercase tracking-wider text-right">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/30">
              {users.map((user) => {
                const isProcessing = processing === user.id;
                
                return (
                  <tr key={user.id} className="hover:bg-red-950/20 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{user.name || "Unnamed User"}</div>
                      <div className="text-sm text-red-500/70 font-mono mt-1">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 && (
                          <span className="text-xs text-red-800 font-mono italic">No special roles</span>
                        )}
                        {user.roles.map((r: any) => (
                          <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-red-900/40 border border-red-800 text-red-300 text-xs font-bold shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-red-400" />
                            {r.name}
                            <button 
                              onClick={() => handleRevoke(user.id, r.id, r.name)}
                              disabled={isProcessing}
                              className="ml-2 text-red-500 hover:text-red-300 transition-colors disabled:opacity-50"
                              title="Revoke Role"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <select 
                          className="bg-[#050000] border border-red-900/50 rounded-sm text-red-300 text-sm px-3 py-1.5 outline-none focus:border-red-500 disabled:opacity-50"
                          disabled={isProcessing}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(user.id, e.target.value);
                              e.target.value = ""; // reset after selection
                            }
                          }}
                        >
                          <option value="">+ Assign Role</option>
                          {availableRoles
                            .filter(ar => !user.roles.some((ur: any) => ur.id === ar.id)) // Hide already assigned roles
                            .map((r: any) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        {isProcessing && <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-red-500/50">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
