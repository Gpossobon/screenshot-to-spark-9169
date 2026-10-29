import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Crown, Info, Loader2, Trash2, Trophy, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { AddParticipantDialog } from "@/components/team/AddParticipantDialog";
import { TeamHeader } from "@/components/team/TeamHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isAcademicProfileComplete } from "@/lib/academic-profile";
import { academicProfileQueryOptions } from "@/lib/academic-profile-queries";
import {
  addTeamMember,
  createMyTeam,
  myTeamKey,
  myTeamQueryOptions,
  removeTeamMember,
  type TeamMember,
} from "@/lib/team-queries";
import {
  MAX_TEAM_SIZE,
  canAddMember,
  memberInitials,
  teamStatus,
  translateTeamError,
} from "@/lib/team-rules";
import { cn } from "@/lib/utils";
import { canCreateTeam, myCaptainStatusQueryOptions } from "@/lib/captain-requests";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/minha-equipe")({
  head: () => ({
    meta: [
      { title: "Minha Equipe | MouseTrap Car Race" },
      {
        name: "description",
        content: "Gerencie sua equipe e prepare-se para a competição MouseTrap Car Race.",
      },
      { property: "og:title", content: "Minha Equipe | MouseTrap Car Race" },
      {
        property: "og:description",
        content: "Gerencie sua equipe e prepare-se para a competição.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(
      academicProfileQueryOptions(context.user.id),
    );
    if (!isAcademicProfileComplete(profile)) {
      throw redirect({ to: "/completar-cadastro", replace: true });
    }
    await Promise.all([
      context.queryClient.ensureQueryData(myTeamQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(myCaptainStatusQueryOptions(context.user.id)),
    ]);
  },
  component: MyTeamPage,
});

function MyTeamPage() {
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: members } = useSuspenseQuery(myTeamQueryOptions(user.id));
  const { data: captainStatus } = useSuspenseQuery(myCaptainStatusQueryOptions(user.id));

  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toRemove, setToRemove] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const captain = members.find((m) => m.role === "captain");
  const isCaptain = captain?.user_id === user.id;
  const count = members.length;
  const status = teamStatus(count);
  const refresh = () => queryClient.invalidateQueries({ queryKey: myTeamKey(user.id) });

  async function handleCreate() {
    setCreating(true);
    try {
      await createMyTeam();
      await refresh();
      toast.success("Equipe criada. Você é o capitão.");
    } catch (e) {
      toast.error(translateTeamError(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleAdd(userId: string) {
    await addTeamMember(userId);
    await refresh();
    toast.success("Participante adicionado à equipe.");
  }

  async function handleRemove() {
    if (!toRemove) return;
    setRemoving(true);
    try {
      await removeTeamMember(toRemove.user_id);
      await refresh();
      toast.success(`${toRemove.full_name} foi removido da equipe.`);
      setToRemove(null);
    } catch (e) {
      toast.error(translateTeamError(e));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex min-h-viewport flex-col bg-background">
      <TeamHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Minha equipe</p>
        <h1 className="mt-2 font-headline text-[clamp(2.25rem,6vw,3.5rem)]">Minha Equipe</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Gerencie sua equipe e prepare-se para a competição.
        </p>

        {/* Summary */}
        <section
          aria-label="Resumo da equipe"
          className="mt-8 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card"
        >
          <SummaryItem
            icon={<Users aria-hidden="true" className="size-6 sm:size-7" />}
            value={count > 0 ? `${count} de ${MAX_TEAM_SIZE}` : `0 de ${MAX_TEAM_SIZE}`}
            label="Integrantes"
          />
          <SummaryItem
            icon={<Crown aria-hidden="true" className="size-6 sm:size-7" />}
            value={captain ? captain.full_name : "—"}
            label="Capitão"
          />
          <SummaryItem
            icon={<Trophy aria-hidden="true" className="size-6 sm:size-7" />}
            value="Status"
            label={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-semibold",
                  status.key === "full" ? "text-success" : status.key === "open" ? "text-brand" : "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    status.key === "full" ? "bg-success" : status.key === "open" ? "bg-brand" : "bg-muted-foreground",
                  )}
                />
                {status.label}
              </span>
            }
          />
        </section>

        {/* Team list */}
        <section aria-labelledby="team-title" className="mt-6 rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7 sm:py-5">
            <h2 id="team-title" className="font-display text-xl font-bold sm:text-2xl">
              Sua equipe
            </h2>
            {isCaptain && (
              <Button
                className="h-11 rounded-full px-5 font-semibold"
                disabled={!canAddMember(count)}
                onClick={() => setAddOpen(true)}
              >
                <UserPlus aria-hidden="true" /> Adicionar participante
              </Button>
            )}
          </div>

          {count === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center sm:px-7">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Users aria-hidden="true" className="size-7" />
              </span>
              <p className="mt-4 font-semibold">Você ainda não faz parte de uma equipe.</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {canCreateTeam(captainStatus)
                  ? `Seu pedido de capitão foi aprovado. Crie sua equipe e convide até ${MAX_TEAM_SIZE - 1} colegas.`
                  : captainStatus === "pending"
                    ? "Seu pedido para ser capitão está aguardando aprovação da organização. Enquanto isso, outro capitão pode adicionar você à equipe dele."
                    : captainStatus === "rejected"
                      ? "Seu pedido para ser capitão foi recusado. Quando um capitão adicionar você, a equipe dele aparecerá aqui."
                      : "Quando um capitão adicionar você, a equipe dele aparecerá aqui."}
              </p>
              {canCreateTeam(captainStatus) ? (
                <Button className="mt-6 h-11 rounded-full px-6 font-semibold" disabled={creating} onClick={handleCreate}>
                  {creating ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Crown aria-hidden="true" />}
                  Criar minha equipe
                </Button>
              ) : captainStatus === "pending" ? (
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-pill px-4 py-2 text-sm font-semibold">
                  <Clock aria-hidden="true" className="size-4" /> Aguardando aprovação
                </span>
              ) : (
                <Link
                  to="/completar-cadastro"
                  className="mt-6 rounded text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Quero ser capitão
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li key={m.user_id} className="flex items-center gap-4 px-5 py-4 sm:px-7 sm:py-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-ink-foreground sm:size-12">
                    {memberInitials(m.full_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {m.full_name}
                      {m.user_id === user.id && <span className="font-normal text-muted-foreground"> (você)</span>}
                    </p>
                    {m.ra && <p className="text-sm text-muted-foreground">Matrícula {m.ra}</p>}
                  </div>
                  {m.role === "captain" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <Crown aria-hidden="true" className="size-3.5" /> Capitão
                    </span>
                  ) : (
                    isCaptain && (
                      <button
                        type="button"
                        aria-label={`Remover ${m.full_name} da equipe`}
                        onClick={() => setToRemove(m)}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 aria-hidden="true" className="size-5" />
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}

          {count > 0 && !isCaptain && (
            <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground sm:px-7">
              Somente o capitão pode adicionar ou remover integrantes.
            </p>
          )}
        </section>

        {/* Tip */}
        <aside className="mt-6 flex items-start gap-4 rounded-xl border border-brand/25 bg-brand-soft/60 px-5 py-4 sm:px-7">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-ink-foreground">
            <Info aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-bold text-brand">Dica</p>
            <p className="mt-0.5 text-sm text-foreground/80">
              Sua equipe pode ter até {MAX_TEAM_SIZE} integrantes, incluindo o capitão.
            </p>
          </div>
        </aside>
      </main>

      <InstitutionalFooter />

      {isCaptain && (
        <AddParticipantDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          memberIds={members.map((m) => m.user_id)}
          memberCount={count}
          onAdd={handleAdd}
        />
      )}

      <AlertDialog open={!!toRemove} onOpenChange={(o) => !o && !removing && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover participante?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRemove?.full_name} deixará de fazer parte da sua equipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
            >
              {removing && <Loader2 aria-hidden="true" className="animate-spin" />} Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 px-2 py-5 text-center sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:text-left">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-14">
        {icon}
      </span>
      <div className="min-w-0 max-w-full">
        <p className="truncate font-display text-base font-bold sm:text-xl">{value}</p>
        <div className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{label}</div>
      </div>
    </div>
  );
}
