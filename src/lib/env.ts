const required = ["DATABASE_URL", "SESSION_SECRET"];

export function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export function getEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const isProduction = process.env.NODE_ENV === "production";
export const sessionSecret = () => getRequiredEnv("SESSION_SECRET");
export const sessionCookieName = () =>
  getEnv("SESSION_COOKIE", isProduction ? "__Host-adapt_session" : "adapt_session");
export const contactEmail = () => getEnv("CONTACT_EMAIL", "pulamaliboho@gmail.com");
export const siteUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/$/, "");
  return "http://localhost:3000";
};

export function validateEnv(minimal = false) {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}` +
        (minimal ? "" : " — see .env.example"),
    );
  }
  if (!minimal && process.env.NODE_ENV === "development") {
    // Still allow dev to proceed with defaults for optional settings.
  }
}