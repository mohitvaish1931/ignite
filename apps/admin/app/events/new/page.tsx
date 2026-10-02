import React from "react";
import { db } from "@project-organizer/sdk";
import { PageHeader } from "@project-organizer/ui";
import EventForm from "./EventForm";

export default async function NewEventPage() {
  const categories = await db.eventCategory.findMany();
  
  return (
    <div className="w-full space-y-6">
      <PageHeader 
        title="Create New Event" 
        description="Set up a new event or hackathon."
      />
      <div className="max-w-2xl bg-card rounded-lg border shadow-sm p-6">
        <EventForm categories={categories} />
      </div>
    </div>
  );
}
