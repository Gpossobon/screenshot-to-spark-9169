import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { StandingsTable } from "@/components/portal/StandingsTable";
import { portalQueries, standingsFrom } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/classificacao")({
  head: () =>
    portalHead("Classificação", "Classificação geral das equipes da MouseTrap Car Race, com pontuação por prova."),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(portalQueries.teams()),
      queryClient.ensureQueryData(portalQueries.races()),
    ]),
  component: StandingsPage,
});

function StandingsPage() {
  const { data: teams } = useSuspenseQuery(portalQueries.teams());
  const { data: races } = useSuspenseQuery(portalQueries.races());
  const standings = standingsFrom(teams, races);

  return (
    <PortalLayout>
      <PortalSection>
        <SectionHeading as="h1" eyebrow="Campeonato" title="Classificação geral" source={standings.source} className="mb-8" />
        <StandingsTable rows={standings.items} teams={teams.items} />
        <p className="mt-4 text-sm text-muted-foreground">
          Soma dos pontos das provas já realizadas. Empates são decididos pelo número de vitórias.
        </p>
      </PortalSection>
    </PortalLayout>
  );
}
