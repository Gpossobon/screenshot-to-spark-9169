import { Link } from "@tanstack/react-router";
import type { Team } from "@/lib/portal-content";
import type { StandingRow } from "@/lib/portal-rules";
import { cn } from "@/lib/utils";
import { TeamEmblem } from "./TeamEmblem";

const podiumBar = ["bg-podium-1", "bg-podium-2", "bg-podium-3"];

export function StandingsTable({
  rows,
  teams,
  limit,
}: {
  rows: StandingRow[];
  teams: Team[];
  limit?: number;
}) {
  const bySlug = new Map(teams.map((t) => [t.slug, t]));
  const visible = limit ? rows.slice(0, limit) : rows;

  if (!visible.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
        A classificação aparece aqui depois da primeira prova.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-left">
        <caption className="sr-only">Classificação geral das equipes</caption>
        <thead className="bg-ink text-ink-foreground">
          <tr className="text-[11px] font-bold uppercase tracking-[0.16em]">
            <th scope="col" className="w-16 py-3 pl-5 sm:w-20">Pos.</th>
            <th scope="col" className="py-3">Equipe</th>
            <th scope="col" className="hidden py-3 text-center sm:table-cell">Provas</th>
            <th scope="col" className="py-3 pr-5 text-right">Pontos</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => {
            const team = bySlug.get(row.teamSlug);
            if (!team) return null;
            return (
              <tr
                key={row.teamSlug}
                className={cn(
                  "border-b border-border transition-colors last:border-b-0 hover:bg-accent",
                  row.podium && "bg-brand-soft/40",
                )}
              >
                <td className="relative py-3 pl-5">
                  {row.podium && (
                    <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1.5", podiumBar[row.position - 1])} />
                  )}
                  <span
                    className={cn(
                      "font-display text-xl font-extrabold tabular-nums [font-stretch:115%]",
                      row.podium ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {row.position}
                  </span>
                  {row.podium && <span className="sr-only"> (pódio)</span>}
                </td>
                <td className="py-3">
                  <Link
                    to="/equipes/$slug"
                    params={{ slug: team.slug }}
                    className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <TeamEmblem team={team} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-base font-bold uppercase tracking-wide">
                        {team.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{team.course}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden py-3 text-center tabular-nums text-muted-foreground sm:table-cell">
                  {row.racesCompleted}
                </td>
                <td className="py-3 pr-5 text-right">
                  <span className="inline-block min-w-12 rounded-md bg-pill px-2.5 py-1 text-center font-display text-base font-extrabold tabular-nums">
                    {row.points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
