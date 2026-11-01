import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Crown, GraduationCap } from "lucide-react";
import type { Team } from "@/lib/portal-content";
import { cn } from "@/lib/utils";

const toneClass: Record<Team["tone"], string> = {
  brand: "bg-brand",
  ink: "bg-ink",
  steel: "bg-steel",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function TeamCard({ team, position }: { team: Team; position?: number | undefined }) {
  return (
    <Link
      to="/equipes/$slug"
      params={{ slug: team.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "bg-speed-stripes relative flex h-36 items-center justify-center text-ink-foreground",
          toneClass[team.tone],
        )}
      >
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={`Logo ${team.name}`} className="h-24 w-auto object-contain" loading="lazy" />
        ) : (
          <span className="font-display text-6xl font-extrabold tracking-tight [font-stretch:125%]" aria-hidden="true">
            {team.abbreviation}
          </span>
        )}
        {position && (
          <span className="absolute left-3 top-3 rounded-md bg-ink-foreground px-2 py-1 font-display text-sm font-extrabold text-ink">
            P{position}
          </span>
        )}
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-3 top-3 size-5 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-headline text-xl">{team.name}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <GraduationCap aria-hidden="true" className="size-4" /> {team.course}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm">
          <Crown aria-hidden="true" className="size-4 text-brand" />
          <span className="text-muted-foreground">Capitão:</span>
          <span className="font-semibold">{team.captain}</span>
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex -space-x-2" aria-hidden="true">
            {team.members.map((m) => (
              <span
                key={m}
                className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-pill text-[11px] font-bold"
              >
                {initials(m)}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {team.members.length} {team.members.length === 1 ? "integrante" : "integrantes"}
          </span>
        </div>
      </div>
    </Link>
  );
}
