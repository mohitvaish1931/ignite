import React from "react";
import { PageHeader } from "@project-organizer/ui";
import HackathonForm from "../../new/HackathonForm";
import { getEventById } from "../../../actions/events";
import { notFound } from "next/navigation";

export default async function EditHackathonPage({ params }: { params: { id: string } }) {
  const res = await getEventById(params.id);
  
  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title={`Edit Hackathon: ${res.data.name}`}
        description="Update your hackathon details and posters."
      />
      <div className="bg-card border rounded-lg p-6">
        <HackathonForm initialData={res.data} />
      </div>
    </div>
  );
}
