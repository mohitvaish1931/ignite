"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, notify, Label } from "@project-organizer/ui";
import { createSchedule, createSession } from "../../actions/schedules";
import { Plus } from "lucide-react";

export default function ScheduleManager({ eventId, initialSchedules }: { eventId: string, initialSchedules: any[] }) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  
  // Schedule state
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [addingSchedule, setAddingSchedule] = useState(false);

  // Session state
  const [addingSessionFor, setAddingSessionFor] = useState<string | null>(null);

  const handleAddSchedule = async () => {
    if (!newScheduleName || !newScheduleDate) {
      return notify.error("Please provide both name and date");
    }
    const res = await createSchedule({ eventId, name: newScheduleName, date: newScheduleDate });
    if (res.success) {
      notify.success("Schedule created");
      setAddingSchedule(false);
      setNewScheduleName("");
      setNewScheduleDate("");
      router.refresh();
    } else {
      notify.error(res.error || "Failed to create schedule");
    }
  };

  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingSessionFor) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      scheduleId: addingSessionFor,
      title: formData.get("title") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      description: formData.get("description") as string,
      capacity: Number(formData.get("capacity")) || 0,
    };

    const res = await createSession(payload);
    if (res.success) {
      notify.success("Session created");
      setAddingSessionFor(null);
      router.refresh();
    } else {
      notify.error(res.error || "Failed to create session");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-muted-foreground">Days / Tracks</h4>
        {!addingSchedule && (
          <Button variant="outline" size="sm" onClick={() => setAddingSchedule(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Day
          </Button>
        )}
      </div>

      {addingSchedule && (
        <div className="p-4 border rounded-md space-y-4 bg-muted/20">
          <h4 className="text-sm font-semibold">New Schedule Day</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name (e.g. Day 1, Main Track)</Label>
              <Input value={newScheduleName} onChange={(e) => setNewScheduleName(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={newScheduleDate} onChange={(e) => setNewScheduleDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAddingSchedule(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddSchedule}>Save Day</Button>
          </div>
        </div>
      )}

      {schedules.map((schedule) => (
        <div key={schedule.id} className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <div>
              <h4 className="font-semibold">{schedule.name}</h4>
              <p className="text-sm text-muted-foreground">{new Date(schedule.date).toLocaleDateString()}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setAddingSessionFor(schedule.id)}>
              + Add Session
            </Button>
          </div>

          <div className="space-y-2">
            {schedule.sessions?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sessions scheduled.</p>
            ) : (
              schedule.sessions?.map((session: any) => (
                <div key={session.id} className="bg-muted/30 p-3 rounded-md text-sm border flex justify-between">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-muted-foreground text-xs">{new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {addingSessionFor === schedule.id && (
            <form onSubmit={handleAddSession} className="mt-4 p-4 bg-background border rounded-md shadow-sm space-y-4">
              <h5 className="font-medium text-sm">Add New Session</h5>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Opening Keynote" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" name="startTime" required />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="datetime-local" name="endTime" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Optional brief description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" size="sm" onClick={() => setAddingSessionFor(null)}>Cancel</Button>
                <Button size="sm" type="submit">Save Session</Button>
              </div>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
