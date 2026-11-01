import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { EventHero } from "@/components/portal/EventHero";
import { EventSchedule } from "@/components/portal/EventSchedule";
import { NewsGrid } from "@/components/portal/NewsGrid";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { ResultsBoard } from "@/components/portal/ResultsBoard";
import { StandingsTable } from "@/components/portal/StandingsTable";
import { TeamCard } from "@/components/portal/TeamCard";
import { portalQueries, standingsFrom } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/inicio")({
  head: () =>
    portalHead(
      "Início",
      "Portal da MouseTrap Car Race: evento, programação, classificação, equipes, resultados e notícias da competição de carrinhos movidos a ratoeira.",
    ),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(portalQueries.event()),
      queryClient.ensureQueryData(portalQueries.schedule()),
      queryClient.ensureQueryData(portalQueries.teams()),
      queryClient.ensureQueryData(portalQueries.races()),
      queryClient.ensureQueryData(portalQueries.news()),
    ]),
  component: HomePage,
});

function HomePage() {
  const { data: event } = useSuspenseQuery(portalQueries.event());
  const { data: schedule } = useSuspenseQuery(portalQueries.schedule());
  const { data: teams } = useSuspenseQuery(portalQueries.teams());
  const { data: races } = useSuspenseQuery(portalQueries.races());
  const { data: news } = useSuspenseQuery(portalQueries.news());
  const standings = standingsFrom(teams, races);
  const positionOf = new Map(standings.items.map((r) => [r.teamSlug, r.position]));

  return (
    <PortalLayout>
      <EventHero event={event} />

      <PortalSection>
        <SectionHeading
          eyebrow="O evento"
          title="Informações e programação"
          link={{ to: "/evento", label: "Programação completa" }}
          className="mb-8"
        />
        <EventSchedule event={event} schedule={schedule} />
      </PortalSection>

      <PortalSection tone="surface">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Campeonato"
              title="Classificação geral"
              source={standings.source}
              link={{ to: "/classificacao", label: "Tabela completa" }}
              className="mb-8"
            />
            <StandingsTable rows={standings.items} teams={teams.items} limit={5} />
          </div>
          <div>
            <SectionHeading eyebrow="Grid" title="Equipes" link={{ to: "/equipes", label: "Ver todas" }} className="mb-8" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {teams.items.slice(0, 2).map((team) => (
                <TeamCard key={team.slug} team={team} position={positionOf.get(team.slug)} />
              ))}
            </div>
          </div>
        </div>
      </PortalSection>

      <PortalSection>
        <SectionHeading
          eyebrow="Pista"
          title="Resultados das provas"
          source={races.source}
          link={{ to: "/resultados", label: "Todos os resultados" }}
          className="mb-8"
        />
        <ResultsBoard races={races.items} teams={teams.items} />
      </PortalSection>

      <PortalSection tone="surface">
        <SectionHeading
          eyebrow="Paddock"
          title="Notícias e comunicados"
          source={news.source}
          link={{ to: "/noticias", label: "Todas as notícias" }}
          className="mb-8"
        />
        <NewsGrid items={news.items} demo={news.source === "demo"} />
      </PortalSection>
    </PortalLayout>
  );
}
