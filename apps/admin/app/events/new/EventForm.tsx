"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, notify, Label, DateTimePicker } from "@project-organizer/ui";
import { createEvent, updateEvent } from "../../actions/events";

export default function EventForm({ categories, initialData }: { categories: any[], initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = isEditing
      ? await updateEvent(initialData.id, formData)
      : await createEvent(formData);
      
    setLoading(false);

    if (res.success) {
      notify.success(`Event ${isEditing ? 'updated' : 'created'} successfully`);
      router.push(`/events`);
    } else {
      notify.error(res.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input id="name" name="name" required defaultValue={initialData?.name} placeholder="e.g. HackMIT 2026" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" name="slug" required defaultValue={initialData?.slug} placeholder="e.g. hackmit-2026" disabled={isEditing} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryName">Category</Label>
        <select 
          id="categoryName" 
          name="categoryName" 
          required 
          defaultValue={initialData?.category?.name || ""}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>Select a category...</option>
          <option value="CENTERSTAGE EVENTS">CENTERSTAGE EVENTS</option>
          <option value="DEPARTMENTAL EVENTS">DEPARTMENTAL EVENTS</option>
          <option value="GUEST LECTURES">GUEST LECTURES</option>
          <option value="Hackathon">Hackathon</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="imageFile">Upload Image {isEditing && "(Leave empty to keep current)"}</Label>
          <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
          {isEditing && initialData?.imageUrl && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <span>Current:</span>
              <img src={initialData.imageUrl} alt="Poster" className="w-10 h-10 object-cover rounded-md" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Or Image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={initialData?.imageUrl} placeholder="e.g. https://example.com/image.jpg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date & Time</Label>
          <DateTimePicker id="startAt" name="startAt" required defaultValue={initialData?.startAt ? new Date(initialData.startAt) : undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">End Date & Time</Label>
          <DateTimePicker id="endAt" name="endAt" required defaultValue={initialData?.endAt ? new Date(initialData.endAt) : undefined} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity (Optional)</Label>
        <Input id="capacity" name="capacity" type="number" defaultValue={initialData?.capacity} placeholder="e.g. 1000" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary (Optional)</Label>
        <Input id="summary" name="summary" defaultValue={initialData?.summary} placeholder="Brief description of the event" />
      </div>
      <div className="space-y-4 border-t border-white/[0.07] pt-4">
        <h3 className="text-lg font-medium text-slate-200">Additional Resources & Info</h3>
        
        <div className="space-y-2">
          <Label htmlFor="aboutText">About Event (Text Description)</Label>
          <textarea 
            id="aboutText" 
            name="aboutText" 
            defaultValue={initialData?.settings?.metadata?.aboutText} 
            placeholder="Detailed description of the event..."
            className="w-full min-h-[100px] bg-[#07080d] border border-white/[0.07] rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aboutFile">About Event (File/PDF/Image)</Label>
            <Input id="aboutFile" name="aboutFile" type="file" accept="image/*,.pdf" />
            {isEditing && initialData?.settings?.metadata?.aboutFileUrl && (
              <a href={initialData.settings.metadata.aboutFileUrl} target="_blank" className="text-xs text-orange-400 hover:underline">View Current File</a>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduleFile">Schedule (File/PDF/Image)</Label>
            <Input id="scheduleFile" name="scheduleFile" type="file" accept="image/*,.pdf" />
            {isEditing && initialData?.settings?.metadata?.scheduleFileUrl && (
              <a href={initialData.settings.metadata.scheduleFileUrl} target="_blank" className="text-xs text-orange-400 hover:underline">View Current Schedule</a>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="markingSchemeFile">Marking Scheme (File/PDF/Image)</Label>
            <Input id="markingSchemeFile" name="markingSchemeFile" type="file" accept="image/*,.pdf" />
            {isEditing && initialData?.settings?.metadata?.markingSchemeFileUrl && (
              <a href={initialData.settings.metadata.markingSchemeFileUrl} target="_blank" className="text-xs text-orange-400 hover:underline">View Current Marking Scheme</a>
            )}
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Event" : "Create Event")}
        </Button>
      </div>
    </form>
  );
}
