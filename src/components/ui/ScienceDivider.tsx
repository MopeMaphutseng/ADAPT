import { Reveal } from "@/components/ui/Reveal";

/**
 * Animated HUD standoff / section divider: a glowing line with an
 * oscilloscope waveform riding across it.
 */
export function ScienceDivider({ className = "" }: { className?: string }) {
  const bars = Array.from({ length: 14 }, (_, i) => i);
  return (
    <Reveal className={className} delay={0}>
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/25" />
        <div className="flex h-5 items-end gap-[3px]">
          {bars.map((i) => (
            <span
              key={i}
              className="w-[3px] origin-bottom animate-oscillate rounded-full bg-gradient-to-t from-accent-500 via-cyanx to-transparent"
              style={{ height: 16, animationDelay: `${(i % 7) * 120}ms`, opacity: 0.35 + ((i % 5) / 5) * 0.6 }}
            />
          ))}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/25 to-transparent" />
      </div>
    </Reveal>
  );
}