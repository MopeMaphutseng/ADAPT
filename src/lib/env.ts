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
export const sessionCookieName = () => getEnv("SESSION_COOKIE", "adapt_session");
export const contactEmail = () => getEnv("CONTACT_EMAIL", "pulamaliboho@gmail.com");
export const siteUrl = () =>
  getEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, "");

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