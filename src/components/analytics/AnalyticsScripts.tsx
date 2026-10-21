import type { SiteContent } from "@/lib/settings";

/**
 * Inject a configured analytics provider script. Nothing is injected until a
 * provider + script id is set by the administrator (admin → Site Content).
 */
export function AnalyticsScripts({ settings }: { settings: SiteContent }) {
  const a = settings.analytics;
  if (!a.enabled || !a.scriptId) return null;
  if (a.provider.toLowerCase().includes("plausible")) {
    return (
      <script
        defer
        data-domain={a.scriptId}
        src="https://plausible.io/js/script.js"
      />
    );
  }
  return null;
}