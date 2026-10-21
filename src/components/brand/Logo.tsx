export function LogoMark({
  size = 36,
  className = "",
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-g" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4a99ff" />
          <stop offset="0.55" stopColor="#38e1ff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {glow ? <circle cx="24" cy="24" r="20" fill="rgba(31,127,255,0.14)" filter="blur(6px)" /> : null}
      <path
        d="M24 3 41.6 13.5v19L24 43 6.4 32.5v-19L24 3Z"
        stroke="url(#logo-g)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 8.5 36.5 15.75v14.5L24 37.5 11.5 30.25V15.75L24 8.5Z"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 15v18M17.5 19.5v12M30.5 19.5v12"
        stroke="url(#logo-g)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  name = "ADAPT",
  sub = "TECHNOLOGIES",
  size = 36,
  glow = true,
}: {
  name?: string;
  sub?: string;
  size?: number;
  glow?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 text-white">
      <LogoMark size={size} glow={glow} />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-[0.16em]">{name}</span>
        <span className="mt-0.5 font-mono text-[0.7rem] tracking-[0.34em] text-cyanx">
          {sub}
        </span>
      </span>
    </span>
  );
}