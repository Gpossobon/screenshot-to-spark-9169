import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Flag, LogOut, Users } from "lucide-react";
import mascot from "@/assets/mouse-racetrap-mascote.png.asset.json";
import { AuthHeader } from "@/components/auth/AuthLayout";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isAcademicProfileComplete } from "@/lib/academic-profile";
import { academicProfileQueryOptions } from "@/lib/academic-profile-queries";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do piloto | MouseTrap Car Race" },
      { name: "description", content: "Área do participante da competição MouseTrap Car Race." },
      { property: "og:title", content: "Painel do piloto | MouseTrap Car Race" },
      { property: "og:description", content: "Área do participante da competição MouseTrap Car Race." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  // Participants without academic data finish that step first.
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(
      academicProfileQueryOptions(context.user.id),
    );
    if (!isAcademicProfileComplete(profile)) {
      throw redirect({ to: "/completar-cadastro", replace: true });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: profile } = useSuspenseQuery(academicProfileQueryOptions(user.id));

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const meta = user.user_metadata as { full_name?: string; name?: string };
  const name = profile?.full_name || meta.full_name || meta.name || user.email;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthHeader mode="none" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <img src={mascot.url} alt="" width={180} height={180} className="w-40 object-contain" />
        <p className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
          <Flag aria-hidden="true" className="size-4" /> Você está no grid
        </p>
        <h1 className="mt-3 font-headline text-[clamp(2rem,5vw,3rem)]">Bem-vindo, {name}</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Sua conta está ativa. As próximas etapas da competição aparecerão aqui.
        </p>
        <Link
          to="/completar-cadastro"
          className="mt-4 rounded text-sm font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Editar dados acadêmicos
        </Link>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="xl" className="rounded-full px-8 font-semibold">
            <Link to="/minha-equipe">
              <Users aria-hidden="true" /> Minha equipe
            </Link>
          </Button>
          <Button variant="ink" size="xl" className="px-8" onClick={handleSignOut}>
            <LogOut aria-hidden="true" /> Sair
          </Button>
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
