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

      {/* Mousetrap torsion spring (right edge): coil, two arms and the arc the bar travels */}
      <g
        className="text-brand"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(540 438)"
      >
        {/* Swing path of the released arm (stored elastic energy) */}
        <path
          d="M-30 -100 A 104 104 0 0 1 50 -91"
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity="0.35"
        />
        <path d="M40 -98 l 10 7 l -10 5" strokeWidth="1" opacity="0.35" />
        {/* Coil loops */}
        <g strokeWidth="1.25" opacity="0.32">
          {Array.from({ length: 7 }).map((_, i) => (
            <ellipse key={i} cx="0" cy={-21 + i * 7} rx="17" ry="8" />
          ))}
        </g>
        {/* Arm (bail) under tension, with hooked end */}
        <path d="M-10 -29 L -30 -100 l -12 -2" strokeWidth="1.5" opacity="0.32" />
        {/* Anchor arm */}
        <path d="M10 29 L 24 96 l -12 4" strokeWidth="1.5" opacity="0.24" />
        {/* Pivot */}
        <circle cx="0" cy="0" r="2.5" fill="currentColor" stroke="none" opacity="0.35" />
      </g>

      {/* Start grid ticks */}
      <g className="text-brand" fill="currentColor" opacity="0.1">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={40 + i * 18} y={118} width="9" height="9" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={`b${i}`} x={49 + i * 18} y={127} width="9" height="9" />
        ))}
      </g>
    </svg>
  );
}
