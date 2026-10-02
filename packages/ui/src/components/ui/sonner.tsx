"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:backdrop-blur-md group-[.toaster]:bg-background/80 font-sans",
          description: "group-[.toast]:text-muted-foreground text-sm",
          title: "group-[.toast]:font-medium text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          success: "group-[.toast]:border-success/30 group-[.toast]:bg-success/10",
          error: "group-[.toast]:border-destructive/30 group-[.toast]:bg-destructive/10",
          warning: "group-[.toast]:border-amber-500/30 group-[.toast]:bg-amber-500/10",
          info: "group-[.toast]:border-primary/30 group-[.toast]:bg-primary/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
