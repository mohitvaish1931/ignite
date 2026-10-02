"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Label, notify } from "@project-organizer/ui";
import { createOrganizer } from "../../actions/organizers";

export default function AddOrganizerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrganizer(formData);

    if (result.success) {
      notify.success("Organizer created successfully!");
      router.push("/organizers");
      router.refresh();
    } else {
      notify.error(result.error || "Failed to create organizer");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="john@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" name="password" type="text" placeholder="ieee@2026 (default)" />
          <p className="text-xs text-slate-400">If left blank, 'ieee@2026' will be used.</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.07]">
        <Button variant="outline" type="button" onClick={() => router.push("/organizers")}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Organizer"}
        </Button>
      </div>
    </form>
  );
}
