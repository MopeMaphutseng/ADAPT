"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight first-party page-view beacon. Records only the path and referrer
 * (no personal information). Configurable via NEXT_PUBLIC_ANALYTICS_ENABLED.
 */
export function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-adapt-requested-with": "adapt-client" },
        body: JSON.stringify({ path: pathname, referrer: document.referrer }),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => {});
    }, 1200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [pathname]);
  return null;
}