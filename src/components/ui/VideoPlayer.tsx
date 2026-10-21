import { Volume2, Video as VideoIcon } from "lucide-react";

/**
 * True for media stored locally under /public (served by this site), as
 * opposed to an external URL (YouTube, Vimeo, Drive, …) which should be
 * linked out to instead of embedded.
 */
export function isLocalVideo(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("/media") || url.includes("/media/");
}

/**
 * Styled, design-system-consistent video player. Renders a framed 16:9
 * player for local media files and degrades gracefully on small screens.
 */
export function VideoPlayer({
  src,
  title,
  poster,
  label = "Recorded footage",
  className = "",
}: {
  src: string;
  title?: string;
  poster?: string | null;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={`card hud-frame card-grid overflow-hidden !p-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-cyanx">
          <VideoIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="relative aspect-video w-full bg-ink-950">
        <video
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster ?? undefined}
          className="h-full w-full bg-black object-cover"
          src={src}
        >
          {title ? <p className="p-4 text-slate-300">{title}</p> : null}
        </video>
        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/70 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-300 backdrop-blur">
          <Volume2 className="h-3 w-3" aria-hidden="true" />
          Muted preview
        </span>
      </div>
      {title ? (
        <figcaption className="border-t border-white/[0.08] px-4 py-3 text-[0.9375rem] text-slate-300">
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * A muted, autoplaying, looping video used as a live backdrop inside cards and
 * thumbnails. Falls back to the supplied poster (cover image) until frames
 * arrive, so the space never shows an empty black rectangle.
 */
export function VideoBackdrop({
  src,
  poster,
  className = "h-full w-full object-cover",
}: {
  src: string;
  poster?: string | null;
  className?: string;
}) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      className={className}
      src={src}
    />
  );
}

