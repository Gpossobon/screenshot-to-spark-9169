import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { NewsGrid } from "@/components/portal/NewsGrid";
import { PortalLayout, PortalSection, SectionHeading } from "@/components/portal/PortalLayout";
import { portalQueries } from "@/lib/portal-content";
import { portalHead } from "@/lib/portal-head";

export const Route = createFileRoute("/noticias")({
  head: () =>
    portalHead("Notícias e comunicados", "Comunicados oficiais, avisos e novidades da MouseTrap Car Race."),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(portalQueries.news()),
  component: NewsPage,
});

function NewsPage() {
  const { data: news } = useSuspenseQuery(portalQueries.news());

  return (
    <PortalLayout>
      <PortalSection>
        <SectionHeading as="h1" eyebrow="Paddock" title="Notícias e comunicados" source={news.source} className="mb-8" />
        <NewsGrid items={news.items} demo={news.source === "demo"} secondaryLimit={Infinity} />
      </PortalSection>
    </PortalLayout>
  );
}
