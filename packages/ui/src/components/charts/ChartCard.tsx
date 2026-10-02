"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { ChartSkeleton } from "../feedback/Skeletons";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { BarChart as BarChartIcon } from "lucide-react";

export interface ChartCardProps {
  title: string;
  description?: string;
  state: "loading" | "empty" | "error" | "populated";
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  state,
  error,
  onRetry,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex-1 min-h-[300px] w-full flex flex-col relative">
        {state === "loading" && (
          <div className="absolute inset-0">
            <ChartSkeleton className="h-full border-none p-0" />
          </div>
        )}
        
        {state === "empty" && (
          <div className="absolute inset-0">
             <EmptyState
              title="No Data Available"
              description="There is no data to display for the selected period."
              icon={<BarChartIcon className="h-10 w-10 text-muted-foreground" />}
              className="h-full border-none bg-transparent"
            />
          </div>
        )}

        {state === "error" && (
          <div className="absolute inset-0">
            <ErrorState
              title="Failed to Load Chart"
              error={error}
              onRetry={onRetry}
              className="h-full border-none"
            />
          </div>
        )}

        {state === "populated" && (
          <div className="h-full w-full animate-in fade-in-50 duration-500">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
