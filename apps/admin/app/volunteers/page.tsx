"use client";

import React, { useEffect, useState } from "react";
import { PageHeader, notify, Button, Input, Label } from "@project-organizer/ui";
import { getVolunteersOverview, assignVolunteer } from "../actions/volunteers";
import { Plus } from "lucide-react";

export default function VolunteersPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getVolunteersOverview();
      if (res.success && res.data) {
        setEvents(res.data);
      } else {
        notify.error(res.error || "Failed to load volunteers data");
      }
      setIsLoading(false);
    }
    load();
  }, [refresh]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !volunteerEmail) return;

    setAssigning(true);
    const res = await assignVolunteer(selectedEventId, volunteerEmail);
    if (res.success) {
      notify.success("Volunteer assigned successfully");
      setAssignModalOpen(false);
      setVolunteerEmail("");
      setRefresh(r => r + 1);
    } else {
      notify.error(res.error || "Failed to assign volunteer");
    }
    setAssigning(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Volunteer Management"
        description="Assign and manage volunteers for your events."
        actions={
          <Button onClick={() => setAssignModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Assign Volunteer
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-400 py-12">No events found.</div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-[#07080d] border border-white/[0.07] rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{event.title}</h3>
                  <p className="text-sm text-slate-400">Public ID: {event.publicId}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  event.state === 'PUBLISHED' 
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                    : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                }`}>
                  {event.state}
                </span>
              </div>

              <div className="space-y-4 mt-6 border-t border-white/[0.07] pt-4">
                <h4 className="font-semibold text-slate-200">Assigned Volunteers ({event.volunteers.length})</h4>
                {event.volunteers.length === 0 ? (
                  <p className="text-sm text-slate-500">No volunteers assigned to this event.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.volunteers.map((vol: any) => (
                      <div key={vol.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                          {vol.name.charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-slate-200 truncate">{vol.name}</span>
                          <span className="text-xs text-slate-400 truncate">{vol.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90dvh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Assign Volunteer</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <select 
                  id="event"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/10 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-orange-500"
                  required
                >
                  <option value="" disabled>Select an Event</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Volunteer Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  required 
                  placeholder="volunteer@example.com" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
