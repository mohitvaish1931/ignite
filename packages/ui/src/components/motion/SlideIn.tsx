"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  offset?: number;
}

export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  offset = 20,
  ...props
}: SlideInProps) {
  const getInitial = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: offset };
      case "down":
        return { opacity: 0, y: -offset };
      case "left":
        return { opacity: 0, x: offset };
      case "right":
        return { opacity: 0, x: -offset };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={getInitial()}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
