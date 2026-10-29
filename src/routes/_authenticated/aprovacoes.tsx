import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Crown, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { TeamHeader } from "@/components/team/TeamHeader";
import { Button } from "@/components/ui/button";
import {
  CAPTAIN_STATUS_LABEL,
  captainRequestsKey,
  captainRequestsQueryOptions,
  decideCaptainRequest,
  isAdminQueryOptions,
  type CaptainStatus,
} from "@/lib/captain-requests";
import { memberInitials, translateTeamError } from "@/lib/team-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/aprovacoes")({
  head: () => ({
    meta: [
      { title: "Aprovação de capitães | MouseTrap Car Race" },
      { name: "description", content: "Aprove ou recuse os pedidos de capitão da competição." },
      { property: "og:title", content: "Aprovação de capitães | MouseTrap Car Race" },
      { property: "og:description", content: "Aprove ou recuse os pedidos de capitão da competição." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  // Admins only; everyone else goes back to their team page.
  loader: async ({ context }) => {
    const isAdmin = await context.queryClient.ensureQueryData(isAdminQueryOptions(context.user.id));
    if (!isAdmin) throw redirect({ to: "/minha-equipe", replace: true });
    await context.queryClient.ensureQueryData(captainRequestsQueryOptions());
  },
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: requests } = useSuspenseQuery(captainRequestsQueryOptions());
  const [busy, setBusy] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  async function decide(userId: string, name: string, approve: boolean) {
    setBusy(userId);
    try {
      await decideCaptainRequest(userId, approve);
      await queryClient.invalidateQueries({ queryKey: captainRequestsKey });
      toast.success(approve ? `${name} agora é capitão.` : `Pedido de ${name} recusado.`);
    } catch (e) {
      toast.error(translateTeamError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex min-h-viewport flex-col bg-background">
      <TeamHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Organização</p>
        <h1 className="mt-2 font-headline text-[clamp(2rem,5vw,3rem)]">Aprovação de capitães</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Participantes que responderam "Sim" em "Você é o capitão?" só criam a equipe depois da sua aprovação.
        </p>

        <section aria-labelledby="pending-title" className="mt-8 rounded-xl border border-border bg-card">
          <h2 id="pending-title" className="border-b border-border px-5 py-4 font-display text-xl font-bold sm:px-7">
            Pendentes ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground sm:px-7">Nenhum pedido pendente.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((r) => (
                <li key={r.user_id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-7">
                  <RequestPerson r={r} />
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-11 flex-1 rounded-full px-5 sm:flex-none"
                      disabled={busy === r.user_id}
                      onClick={() => decide(r.user_id, r.full_name, false)}
                    >
                      <X aria-hidden="true" /> Recusar
                    </Button>
                    <Button
                      className="h-11 flex-1 rounded-full px-5 sm:flex-none"
                      disabled={busy === r.user_id}
                      onClick={() => decide(r.user_id, r.full_name, true)}
                    >
                      {busy === r.user_id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Check aria-hidden="true" />}
                      Aprovar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {decided.length > 0 && (
          <section aria-labelledby="decided-title" className="mt-6 rounded-xl border border-border bg-card">
            <h2 id="decided-title" className="border-b border-border px-5 py-4 font-display text-xl font-bold sm:px-7">
              Já respondidos
            </h2>
            <ul className="divide-y divide-border">
              {decided.map((r) => (
                <li key={r.user_id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-7">
                  <RequestPerson r={r} />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                      r.status === "approved" ? "bg-primary/10 text-primary" : "bg-pill text-muted-foreground",
                    )}
                  >
                    {r.status === "approved" && <Crown aria-hidden="true" className="size-3.5" />}
                    {CAPTAIN_STATUS_LABEL[r.status as Exclude<CaptainStatus, null>]}
                  </span>
                  {r.status === "rejected" && (
                    <Button
                      variant="ghost"
                      className="h-11 rounded-full px-4 text-sm"
                      disabled={busy === r.user_id}
                      onClick={() => decide(r.user_id, r.full_name, true)}
                    >
                      Aprovar mesmo assim
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
}

function RequestPerson({
  r,
}: {
  r: { full_name: string; ra: string; campus: string; turma: string; email: string; created_at: string };
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-ink-foreground">
        {memberInitials(r.full_name || r.email)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{r.full_name || r.email}</p>
        <p className="truncate text-sm text-muted-foreground">
          Matrícula {r.ra || "—"} • {r.campus || "—"} • {r.turma || "—"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {r.email} • pedido em {new Date(r.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
