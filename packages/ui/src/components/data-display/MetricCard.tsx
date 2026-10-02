"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  total?: string | number;
  progress?: number;
  status?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

export function MetricCard({
  title,
  value,
  total,
  progress,
  status = "default",
  className,
}: MetricCardProps) {
  const statusColors = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-amber-500",
    destructive: "bg-destructive",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {total && (
            <span className="text-sm font-medium text-muted-foreground mb-1">
              / {total}
            </span>
          )}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all duration-500", statusColors[status])}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
