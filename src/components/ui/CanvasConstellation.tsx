"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: "blue" | "cyan" | "violet";
};

const COLORS = {
  blue: "74, 153, 255",
  cyan: "56, 225, 255",
  violet: "167, 139, 250",
};

/**
 * Interactive constellation / neural-network particle field.
 * Technique: canvas-nest / tsParticles — dependency-free, DPR-aware,
 * pauses offscreen, honours prefers-reduced-motion (draws one static frame).
 */
export function CanvasConstellation({
  className = "",
  density = 0.00012,
  maxDist = 150,
  interactive = true,
}: {
  className?: string;
  density?: number;
  maxDist?: number;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let reduced = false;
    let particles: Point[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.max(28, Math.round(width * height * density)));
      seeds(count);
    };

    const seeds = (count: number) => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.7,
        hue: (["blue", "cyan", "violet"] as const)[Math.floor(Math.random() * 3)],
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (interactive) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            p.vx += (dx / d) * 0.05;
            p.vy += (dy / d) * 0.05;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        // Gentle damping keeps speed bounded
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // Links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.34;
            ctx.strokeStyle = `rgba(96, 165, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes with glow
      for (const p of particles) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${COLORS[p.hue]}, 0.9)`;
        ctx.fillStyle = `rgba(${COLORS[p.hue]}, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const loop = () => {
      if (!running) return;
      step();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced) {
        step(); // single static frame
        return;
      }
      cancelAnimationFrame(raf);
      loop();
    };

    const onVisibility = () => {
      const hidden = document.hidden;
      running = !hidden;
      if (hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        loop();
      }
    };

    const onPointer = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (interactive) window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (!reduced) cancelAnimationFrame(raf);
      start();
    });
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (interactive) window.removeEventListener("pointermove", onPointer);
    };
  }, [density, maxDist, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
}