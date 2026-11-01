import { cn } from "@/lib/utils";
import type { Team } from "@/lib/portal-content";

const toneClass: Record<Team["tone"], string> = {
  brand: "bg-brand",
  ink: "bg-ink",
  steel: "bg-steel",
};

const sizeClass = {
  sm: "size-9 rounded-md text-xs",
  md: "size-14 rounded-lg text-base",
  lg: "size-24 rounded-xl text-2xl sm:size-28 sm:text-3xl",
};

/** Team logo, or a striped monogram while the team has no logo yet. */
export function TeamEmblem({
  team,
  size = "md",
  className,
}: {
  team: Pick<Team, "name" | "abbreviation" | "tone" | "logoUrl">;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  if (team.logoUrl) {
    return (
      <img
        src={team.logoUrl}
        alt={`Logo ${team.name}`}
        className={cn("shrink-0 bg-surface object-contain", sizeClass[size], className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`Emblema ${team.name}`}
      className={cn(
        "bg-speed-stripes flex shrink-0 items-center justify-center font-display font-extrabold tracking-tight text-ink-foreground [font-stretch:125%]",
        toneClass[team.tone],
        sizeClass[size],
        className,
      )}
    >
      {team.abbreviation}
    </span>
  );
}
