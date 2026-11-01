import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, UserRound, Users } from "lucide-react";
import { useState } from "react";
import mascot from "@/assets/mouse-racetrap-mascote.png.asset.json";
import collegeLogo from "@/assets/uniritter-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthSession } from "@/hooks/use-auth-session";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQueryOptions } from "@/lib/captain-requests";

export const PORTAL_NAV = [
  { to: "/inicio", label: "Início" },
  { to: "/evento", label: "Evento" },
  { to: "/equipes", label: "Equipes" },
  { to: "/classificacao", label: "Classificação" },
  { to: "/resultados", label: "Resultados" },
  { to: "/noticias", label: "Notícias" },
] as const;

const navLinkClass =
  "relative flex h-full items-center px-3 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-0 data-[status=active]:after:h-[3px] data-[status=active]:after:bg-brand";

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PortalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link
          to="/inicio"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MouseTrap Car Race — página inicial"
        >
          <img src={mascot.url} alt="" width={48} height={48} className="size-10 object-contain lg:size-12" />
          <span className="whitespace-nowrap font-headline text-sm text-brand sm:text-base">
            MouseTrap <span className="text-foreground">Car Race</span>
          </span>
        </Link>

        <span aria-hidden="true" className="hidden h-7 w-px bg-border xl:block" />
        <img
          src={collegeLogo.url}
          alt="UniRitter"
          width={169}
          height={34}
          className="hidden h-4 w-auto opacity-80 xl:block"
        />

        <nav aria-label="Principal" className="ml-auto hidden h-full items-stretch lg:flex">
          {PORTAL_NAV.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <NotificationsButton />
          <ProfileMenu />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger aria-label="Abrir menu" className={`${iconButtonClass} lg:hidden`}>
              <Menu aria-hidden="true" className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)] bg-surface">
              <SheetHeader>
                <SheetTitle className="font-headline text-lg text-brand">
                  MouseTrap <span className="text-foreground">Car Race</span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Principal (celular)" className="flex flex-col px-4">
                {PORTAL_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border py-3.5 font-display text-base font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:text-brand"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <img
                src={collegeLogo.url}
                alt="UniRitter"
                width={169}
                height={34}
                className="mx-4 mt-6 h-5 w-auto self-start opacity-80"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NotificationsButton() {
  return (
    <Popover>
      <PopoverTrigger aria-label="Notificações" className={iconButtonClass}>
        <Bell aria-hidden="true" className="size-5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="font-display text-sm font-bold uppercase tracking-wide">Notificações</p>
        <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
          <BellOff aria-hidden="true" className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useAuthSession();
  const userId = session?.user.id ?? "";
  const { data: isAdmin } = useQuery({ ...isAdminQueryOptions(userId), enabled: !!userId });

  if (loading) return <span className="size-10" aria-hidden="true" />;

  if (!session) {
    return (
      <Button asChild variant="ink" size="sm" className="h-9 rounded-full px-4 text-sm font-bold">
        <Link to="/">
          <LogIn aria-hidden="true" /> Entrar
        </Link>
      </Button>
    );
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Perfil" className={iconButtonClass}>
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-ink-foreground">
          <UserRound aria-hidden="true" className="size-4" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate text-xs font-semibold text-muted-foreground">
          {session.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/minha-equipe">
            <Users aria-hidden="true" /> Minha equipe
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/painel">
            <LayoutDashboard aria-hidden="true" /> Painel
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
              <Users aria-hidden="true" /> Aprovar capitães
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
