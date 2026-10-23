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
        <path d="M-40 730 C 120 650, 220 810, 380 730 S 620 610, 700 690" opacity="0.18" />
        <path d="M-40 762 C 120 682, 220 842, 380 762 S 620 642, 700 722" opacity="0.12" />
        <path
          className="animate-dash-run"
          d="M-40 746 C 120 666, 220 826, 380 746 S 620 626, 700 706"
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
        <path d="M470 90 c 10 -24 30 -24 40 0 s 30 24 40 0 s 30 -24 40 0 s 30 24 40 0" />
        <path d="M470 106 c 10 -24 30 -24 40 0 s 30 24 40 0 s 30 -24 40 0 s 30 24 40 0" />
      </g>

      {/* Start grid ticks */}
      <g className="text-brand" fill="currentColor" opacity="0.1">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={30 + i * 18} y={40} width="9" height="9" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={`b${i}`} x={39 + i * 18} y={49} width="9" height="9" />
        ))}
      </g>
    </svg>
  );
}
