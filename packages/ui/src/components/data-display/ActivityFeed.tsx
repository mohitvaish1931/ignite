"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface ActivityFeedItem {
  id: string;
  actor: {
    name: string;
    avatar?: string;
    url?: string;
  };
  action: React.ReactNode;
  entity: {
    name: string;
    url?: string;
  };
  timestamp: string | Date;
  metadata?: React.ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex-shrink-0 pt-1">
            {item.actor.avatar ? (
              <img
                src={item.actor.avatar}
                alt={item.actor.name}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">
                {item.actor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1 text-sm">
              {item.actor.url ? (
                <a href={item.actor.url} className="font-medium text-foreground hover:underline">
                  {item.actor.name}
                </a>
              ) : (
                <span className="font-medium text-foreground">{item.actor.name}</span>
              )}
              
              <span className="text-muted-foreground">{item.action}</span>
              
              {item.entity.url ? (
                <a href={item.entity.url} className="font-medium text-foreground hover:underline">
                  {item.entity.name}
                </a>
              ) : (
                <span className="font-medium text-foreground">{item.entity.name}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {typeof item.timestamp === "string" ? item.timestamp : item.timestamp.toLocaleString()}
              </span>
            </div>
            
            {item.metadata && (
              <div className="mt-2 rounded-md border border-border bg-card/30 p-3 text-sm">
                {item.metadata}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
