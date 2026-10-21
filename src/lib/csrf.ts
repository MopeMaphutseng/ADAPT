import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-auth";

const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

/**
 * CSRF defence for state-changing requests.
 * Enforces:
 *  - a custom header (`x-adapt-requested-with`) that browsers cannot set cross-origin
 *  - an Origin/Host match so cross-site requests are rejected
 */
export function assertSameOrigin(req: NextRequest): void {
  const origin = req.headers.get("origin");
  if (!origin) {
    // Non-browser clients (tests, scripts) must present the custom header.
    if (req.headers.get("x-adapt-requested-with") !== "adapt-client") {
      throw new ApiError(403, "Request origin could not be verified.");
    }
    return;
  }
  let parsed: URL;
  let host: string;
  try {
    parsed = new URL(origin);
    host = new URL(req.url).host;
  } catch {
    throw new ApiError(403, "Request origin could not be verified.");
  }
  const hostname = (h: string) => h.replace(/^\[|\]$/g, "").split(":")[0];
  const isAllowed =
    host === parsed.host ||
    (ALLOWED_HOSTS.has(parsed.hostname) && ALLOWED_HOSTS.has(hostname(host)));
  if (!isAllowed) {
    throw new ApiError(403, "Request origin is not allowed.");
  }
}
