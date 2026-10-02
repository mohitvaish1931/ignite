"use client";

import React, { useState } from "react";
import { Upload, Shield, Smartphone, Key } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = ["General", "Profile", "Notifications", "Security", "Integrations", "Billing"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-white/[0.07]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-orange-500 text-orange-400 bg-orange-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4">
        
        {/* General Settings */}
        {activeTab === "General" && (
          <div className="col-span-1 xl:col-span-2 space-y-6">
            <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-white/[0.07]">
                <h2 className="text-lg font-semibold text-slate-100">General Settings</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Organization Name</label>
                    <input 
                      type="text" 
                      defaultValue="IGNITE Organizer" 
                      className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Organization Email</label>
                    <input 
                      type="email" 
                      defaultValue="contact@ignite.org" 
                      className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone Number</label>
                    <input 
                      type="text" 
                      defaultValue="+91 98765 43210" 
                      className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Timezone</label>
                    <select className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50">
                      <option>(GMT+05:30) Asia/Kolkata</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date Format</label>
                    <select className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50">
                      <option>DD MMM YYYY</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Currency</label>
                    <select className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50">
                      <option>INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/[0.07]">
                  <h3 className="text-sm font-medium text-slate-300">Logo</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-[10px]">Upload Logo</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      <p>Recommended size: 200x200px.</p>
                      <p>Max file size: 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/[0.07] flex justify-end bg-black/40">
                <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings - Split into two columns like mockup */}
        {activeTab === "Security" && (
          <>
            {/* Change Password */}
            <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg overflow-hidden h-fit">
              <div className="p-6 border-b border-white/[0.07] flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-slate-100">Change Password</h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <button className="mt-2 bg-orange-600/10 text-orange-400 hover:bg-orange-600/20 hover:text-orange-300 border border-orange-500/20 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm w-max">
                  Update Password
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* 2FA */}
              <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/[0.07] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-slate-100">Two-Factor Authentication</h2>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-slate-400 mb-6">Add an extra layer of security to your account.</p>
                  
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.07] mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">Status</h4>
                      <p className="text-xs text-slate-400 mt-1">Enabled</p>
                    </div>
                    {/* Fake Toggle Switch */}
                    <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer opacity-80">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-200">Backup Codes</h4>
                    <p className="text-xs text-slate-400">Generate backup codes to access your account.</p>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-xs">
                      Generate Codes
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/[0.07] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-slate-100">Active Sessions</h2>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-slate-400 mb-6">Manage your active sessions across different devices.</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Chrome on Windows</p>
                      <p className="text-xs text-slate-500 mt-1">Jaipur, Rajasthan, India • <span className="text-emerald-400">Current Session</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-2">May 18, 2026, 10:30 AM</p>
                      <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium px-3 py-1 rounded-md transition-colors text-xs">
                        Logout All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Fallback for other tabs */}
        {activeTab !== "General" && activeTab !== "Security" && (
          <div className="col-span-1 xl:col-span-2 bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-200 mb-2">{activeTab} Settings</h2>
            <p className="text-slate-400">This section is currently under development.</p>
          </div>
        )}

      </div>
    </div>
  );
}
