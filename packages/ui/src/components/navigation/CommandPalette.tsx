"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Calendar, Users, Code2, QrCode } from "lucide-react";
import { cn } from "../../lib/utils";

// Very basic implementation of CMDK for Raycast-like experience
export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center pt-[20vh] bg-background/50 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={() => setOpen(false)} 
      />
      
      <div className="relative w-full max-w-xl bg-card border border-border/50 shadow-lg shadow-primary/10 rounded-xl overflow-hidden glass-card">
        <Command className="w-full flex flex-col">
          <div className="flex items-center px-4 border-b border-border/50">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="Search organizations, events, or run a command..."
              className="flex h-14 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              <Command.Item className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted cursor-pointer text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors">
                <Calendar className="w-4 h-4" />
                Create New Event
              </Command.Item>
              <Command.Item className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted cursor-pointer text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors">
                <Code2 className="w-4 h-4" />
                Start Hackathon Track
              </Command.Item>
              <Command.Item className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted cursor-pointer text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors">
                <QrCode className="w-4 h-4" />
                Open Scanner Mode
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border/50 my-2" />

            <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              <Command.Item className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted cursor-pointer text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors">
                <Users className="w-4 h-4" />
                User Management
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
