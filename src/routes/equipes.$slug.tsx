import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, GraduationCap, Users } from "lucide-react";
import { DemoNotice, PortalLayout, PortalSection } from "@/components/portal/PortalLayout";
import { TeamEmblem } from "@/components/portal/TeamEmblem";
import { portalQueries, standingsFrom } from "@/lib/portal-content";

export const Route = createFileRoute("/equipes/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    const [teams] = await Promise.all([
      queryClient.ensureQueryData(portalQueries.teams()),
      queryClient.ensureQueryData(portalQueries.races()),
    ]);
    const team = teams.items.find((t) => t.slug === params.slug);
    if (!team) throw notFound();
    return { name: team.name, course: team.course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Equipe não encontrada | MouseTrap Car Race" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} | Equipes | MouseTrap Car Race`;
    const description = `Integrantes, capitão e desempenho da equipe ${loaderData.name} (${loaderData.course}) na MouseTrap Car Race.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: TeamNotFound,
  component: TeamPage,
});

function BackLink() {
  return (
    <Link
      to="/equipes"
      className="inline-flex items-center gap-2 rounded text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft aria-hidden="true" className="size-4" /> Todas as equipes
    </Link>
  );
}

function TeamNotFound() {
  return (
    <PortalLayout>
      <PortalSection>
        <BackLink />
        <h1 className="mt-6 font-headline text-4xl">Equipe não encontrada</h1>
        <p className="mt-3 text-muted-foreground">Confira o endereço ou volte para a lista de equipes.</p>
      </PortalSection>
    </PortalLayout>
  );
}

function TeamPage() {
  const { slug } = Route.useParams();
  const { data: teams } = useSuspenseQuery(portalQueries.teams());
  const { data: races } = useSuspenseQuery(portalQueries.races());
  const team = teams.items.find((t) => t.slug === slug)!;
  const standing = standingsFrom(teams, races).items.find((r) => r.teamSlug === slug);
  const raceResults = races.items
    .filter((r) => r.status === "realizada")
    .map((race) => ({ race, result: race.results.find((x) => x.teamSlug === slug) }));

  return (
    <PortalLayout>
      <PortalSection>
        <BackLink />
        {teams.source === "demo" && <DemoNotice className="mt-4" />}

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <TeamEmblem team={team} size="lg" />
          <div>
            <h1 className="font-headline text-[clamp(2rem,6vw,3.5rem)]">{team.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <GraduationCap aria-hidden="true" className="size-4" /> {team.course}
            </p>
          </div>
          {standing && (
            <dl className="flex gap-3 sm:ml-auto">
              <div className="rounded-lg bg-ink px-5 py-3 text-center text-ink-foreground">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-foreground/60">Posição</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums">{standing.position}º</dd>
              </div>
              <div className="rounded-lg border border-border bg-card px-5 py-3 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Pontos</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums">{standing.points}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card">
            <h2 className="flex items-center gap-2 border-b border-border px-5 py-4 font-display text-base font-bold uppercase tracking-wide">
              <Users aria-hidden="true" className="size-4" /> Integrantes ({team.members.length})
            </h2>
            <ul>
              {team.members.map((member) => (
                <li key={member} className="flex items-center justify-between border-b border-border px-5 py-3 last:border-b-0">
                  <span className="font-semibold">{member}</span>
                  {member === team.captain && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                      <Crown aria-hidden="true" className="size-3.5" /> Capitão
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card">
            <h2 className="border-b border-border px-5 py-4 font-display text-base font-bold uppercase tracking-wide">
              Desempenho nas provas
            </h2>
            {raceResults.length ? (
              <ul>
                {raceResults.map(({ race, result }) => (
                  <li key={race.id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0">
                    <span>
                      <span className="font-semibold">{race.name}</span>{" "}
                      <span className="text-sm text-muted-foreground">· {race.category}</span>
                    </span>
                    {result ? (
                      <span className="text-right text-sm tabular-nums">
                        <span className="font-display text-base font-extrabold">{result.position}º</span>
                        <span className="text-muted-foreground"> · {result.mark} · {result.points} pts</span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não participou</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-muted-foreground">Nenhuma prova realizada ainda.</p>
            )}
          </section>
        </div>
      </PortalSection>
    </PortalLayout>
  );
}
