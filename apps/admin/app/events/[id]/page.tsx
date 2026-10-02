import React from "react";
import { db } from "@project-organizer/sdk";
import { PageHeader } from "@project-organizer/ui";
import ScheduleManager from "./ScheduleManager";
import { getSchedulesByEventId } from "../../actions/schedules";

export default async function EventDashboardPage({ params }: { params: any }) {
  // Await params for Next 15+ compatibility
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const event = await db.event.findUnique({
    where: { id },
    include: {
      category: true,
      organization: true,
    }
  });

  if (!event) {
    return <div>Event not found</div>;
  }

  const schedulesRes = await getSchedulesByEventId(id);
  const schedules = schedulesRes.success ? schedulesRes.data : [];

  return (
    <div className="w-full space-y-6">
      <PageHeader 
        title={event.name} 
        description={`Manage settings, schedules, and attendees for this event.`}
      />
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Event Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Category:</span> {event.category.name}</p>
              <p><span className="text-muted-foreground">Status:</span> {event.state}</p>
              <p><span className="text-muted-foreground">Start:</span> {new Date(event.startAt).toLocaleString()}</p>
              <p><span className="text-muted-foreground">End:</span> {new Date(event.endAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Schedules & Sessions</h3>
            <ScheduleManager eventId={id} initialSchedules={schedules || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
