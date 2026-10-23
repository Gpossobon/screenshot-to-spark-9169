import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flag, Loader2, LogOut } from "lucide-react";
import { useEffect } from "react";
import mascot from "@/assets/mouse-racetrap-mascote.png.asset.json";
import { AuthHeader } from "@/components/auth/AuthLayout";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/painel")({
  ssr: false,
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
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useAuthSession();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-brand" aria-label="Carregando" />
      </div>
    );
  }

  const meta = session.user.user_metadata as { full_name?: string; name?: string };
  const name = meta.full_name || meta.name || session.user.email;

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
        <Button variant="ink" size="xl" className="mt-10 px-8" onClick={handleSignOut}>
          <LogOut aria-hidden="true" /> Sair
        </Button>
      </main>
      <InstitutionalFooter />
    </div>
  );
}
