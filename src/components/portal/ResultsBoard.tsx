import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, Trophy } from "lucide-react";
import type { Team } from "@/lib/portal-content";
import type { Race } from "@/lib/portal-rules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TeamEmblem } from "./TeamEmblem";

export function ResultsBoard({ races, teams }: { races: Race[]; teams: Team[] }) {
  const bySlug = new Map(teams.map((t) => [t.slug, t]));
  const completed = races.filter((r) => r.status === "realizada");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
      {completed.length ? (
        <Tabs defaultValue={completed.at(-1)!.id} className="gap-0">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-b-none rounded-t-lg bg-ink p-1.5">
            {completed.map((race) => (
              <TabsTrigger
                key={race.id}
                value={race.id}
                className="flex-none rounded-md px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-ink-foreground/70 data-[state=active]:bg-ink-foreground data-[state=active]:text-ink"
              >
                {race.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {completed.map((race) => {
            const best = Math.max(...race.results.map((r) => r.points), 1);
            return (
              <TabsContent key={race.id} value={race.id} className="mt-0">
                <div className="overflow-hidden rounded-b-lg border border-t-0 border-border bg-card">
                  <p className="border-b border-border px-5 py-3 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{race.category}</span> · marca registrada e pontos
                  </p>
                  <table className="w-full text-left">
                    <caption className="sr-only">
                      Resultado da {race.name} — {race.category}
                    </caption>
                    <thead>
                      <tr className="border-b border-border text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        <th scope="col" className="w-14 py-2.5 pl-5">Pos.</th>
                        <th scope="col" className="py-2.5">Equipe</th>
                        <th scope="col" className="py-2.5 text-right">Marca</th>
                        <th scope="col" className="hidden w-40 py-2.5 pl-6 sm:table-cell">Pontos</th>
                        <th scope="col" className="py-2.5 pr-5 text-right sm:hidden">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {race.results.map((r) => {
                        const team = bySlug.get(r.teamSlug);
                        if (!team) return null;
                        return (
                          <tr key={r.teamSlug} className="border-b border-border last:border-b-0">
                            <td className="py-3 pl-5 font-display text-lg font-extrabold tabular-nums">{r.position}</td>
                            <td className="py-3">
                              <span className="flex items-center gap-2.5">
                                <TeamEmblem team={team} size="sm" />
                                <span className="truncate font-semibold">{team.name}</span>
                              </span>
                            </td>
                            <td className="py-3 text-right font-display text-base font-bold tabular-nums">{r.mark}</td>
                            <td className="hidden py-3 pl-6 pr-5 sm:table-cell">
                              <span className="flex items-center gap-2">
                                <span className="h-2 flex-1 overflow-hidden rounded-full bg-pill">
                                  <span
                                    className={cn("block h-full rounded-full", r.position === 1 ? "bg-brand" : "bg-steel")}
                                    style={{ width: `${(r.points / best) * 100}%` }}
                                  />
                                </span>
                                <span className="w-6 text-right font-bold tabular-nums">{r.points}</span>
                              </span>
                            </td>
                            <td className="py-3 pr-5 text-right font-bold tabular-nums sm:hidden">{r.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
          Os resultados aparecem aqui depois da primeira prova.
        </p>
      )}

      <div className="rounded-lg border border-border bg-card">
        <h3 className="border-b border-border px-5 py-4 font-display text-base font-bold uppercase tracking-wide">
          Histórico das provas
        </h3>
        <ol>
          {races.map((race) => {
            const winner = race.results.find((r) => r.position === 1);
            const winnerTeam = winner ? bySlug.get(winner.teamSlug) : undefined;
            const done = race.status === "realizada";
            return (
              <li key={race.id} className="flex gap-3 border-b border-border px-5 py-4 last:border-b-0">
                {done ? (
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
                ) : (
                  <CircleDashed aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="font-bold">
                    {race.name} <span className="font-normal text-muted-foreground">· {race.category}</span>
                  </p>
                  {done && winnerTeam ? (
                    <Link
                      to="/equipes/$slug"
                      params={{ slug: winnerTeam.slug }}
                      className="mt-1 flex items-center gap-1.5 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trophy aria-hidden="true" className="size-3.5 text-podium-1" />
                      Vencedora: <span className="font-semibold text-foreground">{winnerTeam.name}</span> ({winner!.mark})
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{done ? "Realizada" : "Prevista · data a definir"}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
