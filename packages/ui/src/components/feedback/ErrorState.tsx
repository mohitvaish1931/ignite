"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this content.",
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-medium tracking-tight mb-2 text-destructive">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {error?.message || description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
          Try Again
        </Button>
      )}
    </div>
  );
}
