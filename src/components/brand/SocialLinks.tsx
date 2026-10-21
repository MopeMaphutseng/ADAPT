"use client";

import type { SiteContent } from "@/lib/settings";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zM17.08 17.77h1.84L6.99 4.13H5.01l12.07 13.64z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21.9v-8.4h2.82l.42-3.27H13.5V8.13c0-.95.26-1.6 1.63-1.6h1.73V3.57c-.3-.04-1.33-.13-2.52-.13-2.5 0-4.2 1.52-4.2 4.32v2.41H7.32v3.27h2.82v8.4h3.36z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.92.43.37.81 1.1.81 2.22 0 1.61-.02 2.9-.02 3.3 0 .32.22.7.83.58A11.99 11.99 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.9 2.9 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05 6.33 6.33 0 0 0-5.4 3.05 6.33 6.33 0 0 0 3.09 8.42 6.33 6.33 0 0 0 8.05-2.28 6.33 6.33 0 0 0 .94-3.35V8.91a8.23 8.23 0 0 0 4.83 1.52V6.97a4.82 4.82 0 0 1-1.4-.28z" />
    </svg>
  );
}

interface BrandIconProps {
  className?: string;
}

const SOCIAL_COMPONENTS: Record<string, React.ComponentType<BrandIconProps>> = {
  linkedin: LinkedInIcon,
  x: XIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  github: GitHubIcon,
  tiktok: TikTokIcon,
};

export function SocialIcon({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const Cmp = SOCIAL_COMPONENTS[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
}

export function SocialLinks({ settings }: { settings: SiteContent }) {
  const socials = Object.entries(settings.social).filter(([, url]) => url?.trim());
  if (socials.length === 0) return null;
  const labels: Record<string, string> = {
    linkedin: "LinkedIn",
    x: "X (Twitter)",
    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    github: "GitHub",
    tiktok: "TikTok",
  };
  return (
    <div className="mt-5 flex items-center gap-2.5">
      {socials.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${labels[key] ?? key} (opens in new tab)`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition-colors hover:border-accent-500 hover:text-white"
        >
          <SocialIcon name={key} />
        </a>
      ))}
    </div>
  );
}