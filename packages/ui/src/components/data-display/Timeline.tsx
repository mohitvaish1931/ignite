"use client";

import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface TimelineNode {
  id: string;
  title: string;
  timestamp: string | Date;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  metadata?: Record<string, string>;
  diff?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  avatar?: string;
}

export interface TimelineProps {
  items: TimelineNode[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent", className)}>
      {items.map((item, index) => (
        <TimelineItem key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </div>
  );
}

function TimelineItem({ item, isLast }: { item: TimelineNode; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = (item.metadata && Object.keys(item.metadata).length > 0) || (item.diff && item.diff.length > 0);

  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
        {item.avatar ? (
          <img src={item.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : item.icon ? (
          item.icon
        ) : (
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
        )}
      </div>

      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <time className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {typeof item.timestamp === "string" ? item.timestamp : item.timestamp.toLocaleString()}
            </time>
            {item.badge && <div>{item.badge}</div>}
          </div>
        </div>
        <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}

        {hasDetails && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isExpanded ? <ChevronDown className="mr-1 h-3 w-3" /> : <ChevronRight className="mr-1 h-3 w-3" />}
              {isExpanded ? "Hide Details" : "View Details"}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in-50 duration-200">
                {item.metadata && Object.entries(item.metadata).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {item.diff && item.diff.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground block">Changes</span>
                    {item.diff.map((diff, i) => (
                      <div key={i} className="text-xs font-mono bg-background border border-border rounded p-2">
                        <span className="text-muted-foreground">{diff.field}: </span>
                        <span className="text-destructive line-through mr-2">{diff.oldValue}</span>
                        <span className="text-success">{diff.newValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
