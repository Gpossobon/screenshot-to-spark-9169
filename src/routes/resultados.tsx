import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { ResultsBoard } from "@/components/portal/ResultsBoard";
import { portalQueries } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/resultados")({
  head: () =>
    portalHead("Resultados", "Tempos, distâncias e pontos de cada prova da MouseTrap Car Race."),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(portalQueries.teams()),
      queryClient.ensureQueryData(portalQueries.races()),
    ]),
  component: ResultsPage,
});

function ResultsPage() {
  const { data: teams } = useSuspenseQuery(portalQueries.teams());
  const { data: races } = useSuspenseQuery(portalQueries.races());

  return (
    <PortalLayout>
      <PortalSection>
        <SectionHeading as="h1" eyebrow="Pista" title="Resultados das provas" source={races.source} className="mb-8" />
        <ResultsBoard races={races.items} teams={teams.items} />
      </PortalSection>
    </PortalLayout>
  );
}
