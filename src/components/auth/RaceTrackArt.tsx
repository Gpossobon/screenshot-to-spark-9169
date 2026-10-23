/** Thin track lanes, speed lines and a spring coil — navy/grey with a red detail. */
export function RaceTrackArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Track lanes */}
      <g className="text-brand" stroke="currentColor" strokeWidth="1">
        <path d="M-40 640 C 120 560, 220 720, 380 640 S 620 520, 700 600" opacity="0.18" />
        <path d="M-40 672 C 120 592, 220 752, 380 672 S 620 552, 700 632" opacity="0.12" />
        <path
          className="animate-dash-run"
          d="M-40 656 C 120 576, 220 736, 380 656 S 620 536, 700 616"
          opacity="0.28"
          strokeDasharray="14 12"
        />
      </g>

      {/* Speed lines */}
      <g className="text-muted-foreground" stroke="currentColor" strokeLinecap="round">
        <line x1="40" y1="190" x2="170" y2="190" strokeWidth="1.5" opacity="0.35" />
        <line x1="70" y1="210" x2="150" y2="210" strokeWidth="1.5" opacity="0.25" />
        <line x1="20" y1="230" x2="120" y2="230" strokeWidth="1.5" opacity="0.18" />
        <line x1="460" y1="120" x2="580" y2="120" strokeWidth="1.5" opacity="0.25" />
        <line x1="490" y1="140" x2="570" y2="140" strokeWidth="1.5" opacity="0.18" />
      </g>
      <line
        className="text-primary"
        x1="40"
        y1="170"
        x2="96"
        y2="170"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Spring coil */}
      <g className="text-brand" stroke="currentColor" strokeWidth="1.25" opacity="0.22">
        <path d="M470 700 c 10 -24 30 -24 40 0 s 30 24 40 0 s 30 -24 40 0 s 30 24 40 0" />
        <path d="M470 716 c 10 -24 30 -24 40 0 s 30 24 40 0 s 30 -24 40 0 s 30 24 40 0" />
      </g>

      {/* Start grid ticks */}
      <g className="text-brand" fill="currentColor" opacity="0.1">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={30 + i * 18} y={740} width="9" height="9" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={`b${i}`} x={39 + i * 18} y={749} width="9" height="9" />
        ))}
      </g>
    </svg>
  );
}
