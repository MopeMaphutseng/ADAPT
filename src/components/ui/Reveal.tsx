"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "left" | "right" | "zoom";

/**
 * ScrollReveal-style reveal (IntersectionObserver, no dependencies).
 * Elements animate in once when they enter the viewport.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : direction === "zoom"
          ? "reveal-zoom"
          : "";

  return (
    <Tag
      ref={ref}
      className={`reveal ${dirClass} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}