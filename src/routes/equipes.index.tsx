import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { TeamCard } from "@/components/portal/TeamCard";
import { portalQueries, standingsFrom } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/equipes/")({
  head: () =>
    portalHead("Equipes", "Conheça as equipes inscritas na MouseTrap Car Race: capitães, integrantes e cursos."),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(portalQueries.teams()),
      queryClient.ensureQueryData(portalQueries.races()),
    ]),
  component: TeamsPage,
});

function TeamsPage() {
  const { data: teams } = useSuspenseQuery(portalQueries.teams());
  const { data: races } = useSuspenseQuery(portalQueries.races());
  const positionOf = new Map(standingsFrom(teams, races).items.map((r) => [r.teamSlug, r.position]));

  return (
    <PortalLayout>
      <PortalSection>
        <SectionHeading as="h1" eyebrow="Grid" title="Equipes" source={teams.source} className="mb-8" />
        {teams.items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.items.map((team) => (
              <TeamCard key={team.slug} team={team} position={positionOf.get(team.slug)} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
            Nenhuma equipe publicada ainda.
          </p>
        )}
      </PortalSection>
    </PortalLayout>
  );
}
