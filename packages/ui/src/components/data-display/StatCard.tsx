"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
          {title}
        </h3>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive !== false
                ? "text-success"
                : "text-destructive"
            )}
          >
            {trend.isPositive !== false ? "+" : "-"}
            {trend.value}%
          </span>
        )}
      </div>
      {(description || trend) && (
        <p className="mt-1 text-sm text-muted-foreground">
          {trend ? trend.label : description}
        </p>
      )}
    </div>
  );
}
