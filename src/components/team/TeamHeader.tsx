import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAdminQueryOptions } from "@/lib/captain-requests";
import { useAuthSession } from "@/hooks/use-auth-session";
import { BadgeCheck, Flag, GraduationCap, LayoutDashboard, LogOut, Menu, Users } from "lucide-react";
// Same official mascot as the login screen (user's choice).
import teamLogo from "@/assets/mouse-racetrap-mascote.png.asset.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

/** Header used only by the "Minha Equipe" page. */
export function TeamHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.user.id ?? "";
  const { data: isAdmin } = useQuery({ ...isAdminQueryOptions(userId), enabled: !!userId });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <Link
          to="/minha-equipe"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Race Team — Minha equipe"
        >
          <img
            src={teamLogo.url}
            alt="Logo Race Team"
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14"
          />
          <span className="flex flex-col leading-none">
            <span className="font-headline text-lg text-brand sm:text-xl">Race Team</span>
            <span className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
              Corrida de Carrinhos
            </span>
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Abrir menu"
            className="flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu aria-hidden="true" className="size-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/inicio">
                <Flag aria-hidden="true" /> Portal da competição
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/painel">
                <LayoutDashboard aria-hidden="true" /> Painel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/minha-equipe">
                <Users aria-hidden="true" /> Minha equipe
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/completar-cadastro">
                <GraduationCap aria-hidden="true" /> Dados acadêmicos
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/aprovacoes">
                  <BadgeCheck aria-hidden="true" /> Aprovar capitães
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut aria-hidden="true" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
