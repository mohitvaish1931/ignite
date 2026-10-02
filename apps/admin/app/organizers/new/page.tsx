import React from "react";
import AddOrganizerForm from "./AddOrganizerForm";

export default function NewOrganizerPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Add New Organizer
        </h1>
      </div>

      <div className="bg-[#07080d] border border-white/[0.07] rounded-2xl shadow-lg p-6">
        <AddOrganizerForm />
      </div>
    </div>
  );
}
