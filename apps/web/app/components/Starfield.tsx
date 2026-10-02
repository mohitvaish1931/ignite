"use client";

import React, { useEffect, useRef } from "react";

/**
 * Twinkling stars and drifting orange stardust (the IEEE IGNITE '26 hero's canvas engine).
 * Fills its nearest positioned parent.
 */
export default function Starfield({ count = 110, className = "" }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.35 + 0.35,
      baseAlpha: Math.random() * 0.75 + 0.15,
      twinkleSpeed: Math.random() * 0.025 + 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
      speedY: -(Math.random() * 0.16 + 0.04),
      speedX: (Math.random() - 0.5) * 0.06,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((s, i) => {
        if (!reduceMotion) {
          s.twinklePhase += s.twinkleSpeed;
          s.y += s.speedY;
          s.x += s.speedX;
          if (s.y < 0) s.y = height;
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
        }
        const alpha = Math.max(0.05, Math.min(1, s.baseAlpha + Math.sin(s.twinklePhase) * 0.3));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        if (i % 5 === 0) {
          ctx.fillStyle = `rgba(255, 175, 75, ${alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = "#ff9900";
        } else {
          ctx.fillStyle = `rgba(240, 246, 255, ${alpha})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });
      if (!reduceMotion) frame = requestAnimationFrame(render);
    };
    render();

    // Pause the animation while the tab is hidden
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) render();
    };
    const onResize = () => {
      resize();
      if (reduceMotion) render();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true" />;
}
