"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { FileQuestion } from "lucide-react";
import { Button } from "../ui/button";

export interface NotFoundProps {
  title?: string;
  description?: string;
  onBack?: () => void;
  className?: string;
}

export function NotFound({
  title = "Page Not Found",
  description = "The page or resource you are looking for doesn't exist or has been moved.",
  onBack,
  className,
}: NotFoundProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4 text-muted-foreground">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-medium tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {onBack && (
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      )}
    </div>
  );
}
