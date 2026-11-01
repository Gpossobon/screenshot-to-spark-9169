import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { EventHero } from "@/components/portal/EventHero";
import { EventSchedule } from "@/components/portal/EventSchedule";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { portalQueries } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/evento")({
  head: () =>
    portalHead(
      "Evento e programação",
      "Data, horário, local e cronograma de atividades da MouseTrap Car Race 2026.",
    ),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(portalQueries.event()),
      queryClient.ensureQueryData(portalQueries.schedule()),
    ]),
  component: EventPage,
});

function EventPage() {
  const { data: event } = useSuspenseQuery(portalQueries.event());
  const { data: schedule } = useSuspenseQuery(portalQueries.schedule());

  return (
    <PortalLayout>
      <EventHero event={event} compact />
      <PortalSection>
        <SectionHeading eyebrow="O evento" title="Informações e programação" className="mb-8" />
        <EventSchedule event={event} schedule={schedule} />
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Data, horário e local serão publicados aqui pela organização assim que forem confirmados.
        </p>
      </PortalSection>
    </PortalLayout>
  );
}
