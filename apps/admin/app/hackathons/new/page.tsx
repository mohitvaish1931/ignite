import React from "react";
import { PageHeader } from "@project-organizer/ui";
import HackathonForm from "./HackathonForm";

export default async function NewHackathonPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader 
        title="Create New Hackathon" 
        description="Set up a new dedicated hackathon event."
      />
      <div className="max-w-2xl bg-card rounded-lg border shadow-sm p-6">
        <HackathonForm />
      </div>
    </div>
  );
}
