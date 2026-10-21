import { Reveal } from "@/components/ui/Reveal";

const READOUTS = [
  { label: "AI PLATFORM", value: "PULA MALIBOHO", pct: 72 },
  { label: "EMBEDDED SYSTEMS", value: "ESP32 · SENSORS", pct: 48 },
  { label: "AUTONOMOUS R&D", value: "RESCUE DRONES", pct: 31 },
];

const WAVE = Array.from({ length: 26 }, (_, i) => i);

export function HeroVisual() {
  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <Reveal direction="right" delay={200}>
        <div className="relative">
          {/* Glow behind the console */}
          <div className="absolute -inset-10 -z-10 rounded-full bg-accent-600/[0.12] blur-[80px]" />

          {/* Orbital rings behind + above the console */}
          <div className="pointer-events-none absolute -left-16 -top-24 -z-10 h-[420px] w-[420px]">
            <div className="absolute inset-0 animate-spin-slower rounded-full border border-accent-500/25 border-dashed" />
            <div className="absolute inset-8 animate-spin-reverse rounded-full border border-white/10" style={{ borderTopColor: "rgba(56,225,255,0.7)" }} />
            <div className="absolute inset-20 animate-spin-slower rounded-full border border-violetx-400/20 border-dashed" style={{ animationDuration: "48s" }} />
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyanx shadow-[0_0_12px_rgba(56,225,255,0.9)]" />
            <div className="absolute bottom-6 left-10 h-1.5 w-1.5 rounded-full bg-violetx-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
          </div>

          {/* Floating HUD chips */}
          <div className="chip absolute -left-9 top-6 animate-float !border-accent-500/30 !bg-ink-950/70 font-mono !text-[0.75rem] !tracking-widest text-accent-300 shadow-glow">
            PULA MALIBOHO
          </div>
          <div className="chip absolute -right-6 top-1/3 animate-float-slow !border-cyanx-400/30 !bg-ink-950/70 font-mono !text-[0.75rem] !tracking-widest text-cyanx">
            ESP32 · SENSORS
          </div>
          <div className="chip absolute -bottom-8 left-10 animate-float !border-violetx-400/30 !bg-ink-950/70 font-mono !text-[0.75rem] !tracking-widest text-violetx-300" style={{ animationDelay: "1.2s" }}>
            RESCUE DRONES
          </div>

          {/* Telemetry console */}
          <div className="hud-frame card overflow-hidden !p-0 shadow-card-raised">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(31,127,255,0.9)]" />
              </div>
              <span className="font-mono text-[0.75rem] tracking-[0.28em] text-slate-500">ADAPT // TELEMETRY</span>
            </div>

            {/* Oscilloscope */}
            <div className="relative border-b border-white/[0.08] bg-ink-950/60 px-5 py-5">
              <div className="flex h-12 items-center gap-[3px]">
                {WAVE.map((i) => (
                  <span
                    key={i}
                    className="w-1.5 shrink-0 origin-bottom animate-oscillate rounded-t-sm bg-gradient-to-t from-accent-600 via-cyanx to-cyanx-200"
                    style={{
                      height: 8 + ((i * 37) % 42),
                      animationDelay: `${i * 45}ms`,
                      opacity: 0.5 + ((i % 4) / 4) * 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 h-1/2 animate-wave-scan bg-gradient-to-b from-transparent via-cyanx-500/10 to-transparent" />
              <div className="mt-3 flex justify-between font-mono text-[0.7rem] tracking-widest text-slate-500">
                <span>CH.01 SIGNAL</span>
                <span>2400 BAUD</span>
                <span>LN.30°S</span>
              </div>
            </div>

            {/* Readouts */}
            <div className="space-y-4 px-5 py-5">
              {READOUTS.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-mono tracking-[0.14em] text-slate-400">{row.label}</span>
                    <span className="font-semibold text-white">{row.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-600 via-accent-400 to-cyanx"
                      style={{ width: `${row.pct}%`, boxShadow: "0 0 10px rgba(56,225,255,0.6)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer readout */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/[0.08] bg-white/[0.02] px-5 py-4">
              {[
                { k: "Local Talent", v: "Global Vision" },
                { k: "Adapt", v: "Adjust → Advance" },
                { k: "Built in", v: "Lesotho" },
              ].map((x) => (
                <div key={x.k}>
                  <p className="font-mono text-[0.7rem] tracking-[0.18em] text-slate-500">{x.k}</p>
                  <p className="mt-1 text-sm font-medium text-white">{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}