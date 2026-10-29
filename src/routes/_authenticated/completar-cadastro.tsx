import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Crown, IdCard, Loader2, Mail, User, Users } from "lucide-react";
import { myCaptainStatusKey, myCaptainStatusQueryOptions, setCaptainRequest } from "@/lib/captain-requests";
import { useRef, useState, type FormEvent } from "react";
import { AccountBadge } from "@/components/auth/AccountBadge";
import { AuthField } from "@/components/auth/AuthField";
import { AuthHeader } from "@/components/auth/AuthLayout";
import { FormAlert } from "@/components/auth/FormAlert";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { Button } from "@/components/ui/button";
import {
  validateAcademicProfile,
  type AcademicErrors,
  type AcademicField,
} from "@/lib/academic-profile";
import {
  academicProfileKey,
  academicProfileQueryOptions,
  saveAcademicProfile,
} from "@/lib/academic-profile-queries";

export const Route = createFileRoute("/_authenticated/completar-cadastro")({
  head: () => ({
    meta: [
      { title: "Complete seu cadastro | MouseTrap Car Race" },
      {
        name: "description",
        content: "Informe seus dados acadêmicos para participar da competição MouseTrap Car Race.",
      },
      { property: "og:title", content: "Complete seu cadastro | MouseTrap Car Race" },
      {
        property: "og:description",
        content: "Informe seus dados acadêmicos para participar da competição.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(academicProfileQueryOptions(context.user.id)),
      context.queryClient.ensureQueryData(myCaptainStatusQueryOptions(context.user.id)),
    ]),
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: saved } = useSuspenseQuery(academicProfileQueryOptions(user.id));
  const { data: captainStatus } = useSuspenseQuery(myCaptainStatusQueryOptions(user.id));

  const meta = user.user_metadata as { full_name?: string; name?: string };
  const email = user.email ?? "";

  const [form, setForm] = useState<Record<AcademicField, string>>({
    full_name: saved?.full_name ?? meta.full_name ?? meta.name ?? "",
    ra: saved?.ra ?? "",
    campus: saved?.campus ?? "",
    turma: saved?.turma ?? "",
  });
  // "Você é o capitão?" — new participants must answer; returning ones start from their saved answer.
  const [captain, setCaptain] = useState<"sim" | "nao" | "">(
    captainStatus === "pending" ? "sim" : saved ? "nao" : "",
  );
  const [captainError, setCaptainError] = useState("");
  const [errors, setErrors] = useState<AcademicErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const set = (key: AcademicField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    const result = validateAcademicProfile(form);
    const needsCaptainAnswer = captainStatus !== "approved" && captain === "";
    if (!result.ok || needsCaptainAnswer) {
      setErrors(result.ok ? {} : result.errors);
      if (needsCaptainAnswer) setCaptainError("Informe se você é o capitão da equipe.");
      const first = result.ok
        ? undefined
        : (["full_name", "ra", "campus", "turma"] as const).find((k) => result.errors[k]);
      document.getElementById(first ? `academic-${first}` : "academic-captain")?.focus();
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setErrors({});
    setFormError("");
    try {
      const row = await saveAcademicProfile(user.id, result.data);
      queryClient.setQueryData(academicProfileKey(user.id), row);
      if (captainStatus !== "approved") {
        const next = await setCaptainRequest(captain === "sim");
        queryClient.setQueryData(myCaptainStatusKey(user.id), next);
      }
      navigate({ to: "/minha-equipe", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      setFormError(
        message.includes("fetch") || message.includes("network")
          ? "Não foi possível conectar. Verifique sua internet e tente novamente."
          : "Não foi possível salvar seus dados. Tente novamente em instantes.",
      );
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-viewport flex flex-col bg-background">
      <AuthHeader mode="none" actions={email ? <AccountBadge email={email} /> : null} />

      <main className="flex flex-1 justify-center px-5 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[40rem]">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
            <span aria-hidden="true" className="h-0.5 w-8 bg-primary" />
            Dados acadêmicos
          </p>
          <h1 className="mt-3 font-headline text-[clamp(1.85rem,4vw,2.5rem)] text-foreground">
            Complete seu cadastro
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Preencha seus dados acadêmicos para continuar na plataforma MouseTrap Car Race.
          </p>

          <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
            {formError && <FormAlert tone="error">{formError}</FormAlert>}

            <AuthField
              id="academic-full_name"
              label="Nome completo"
              icon={User}
              name="full_name"
              autoComplete="name"
              placeholder="Digite seu nome completo"
              required
              maxLength={100}
              value={form.full_name}
              onChange={set("full_name")}
              error={errors.full_name ?? null}
            />

            <AuthField
              label="E-mail"
              icon={Mail}
              type="email"
              name="email"
              value={email}
              readOnly
              aria-readonly="true"
              tabIndex={-1}
              hint={
                <p className="text-sm text-muted-foreground">
                  Vinculado à sua conta. Não pode ser alterado aqui.
                </p>
              }
            />

            <AuthField
              id="academic-ra"
              label="RA (Registro Acadêmico)"
              icon={IdCard}
              name="ra"
              autoComplete="off"
              placeholder="Digite seu RA"
              required
              maxLength={50}
              value={form.ra}
              onChange={set("ra")}
              error={errors.ra ?? null}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                id="academic-campus"
                label="Campus"
                icon={Building2}
                name="campus"
                autoComplete="off"
                placeholder="Informe seu campus"
                required
                maxLength={100}
                value={form.campus}
                onChange={set("campus")}
                error={errors.campus ?? null}
              />
              <AuthField
                id="academic-turma"
                label="Turma"
                icon={Users}
                name="turma"
                autoComplete="off"
                placeholder="Informe sua turma"
                required
                maxLength={100}
                value={form.turma}
                onChange={set("turma")}
                error={errors.turma ?? null}
              />
            </div>

            {captainStatus === "approved" ? (
              <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm">
                <Crown aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span>Você é capitão aprovado e pode criar sua equipe.</span>
              </div>
            ) : (
              <fieldset aria-describedby="captain-hint captain-error">
                <legend className="text-sm font-semibold text-foreground">Você é o capitão da equipe?</legend>
                <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-3">
                  {(
                    [
                      ["sim", "Sim"],
                      ["nao", "Não"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      id={value === "sim" ? "academic-captain" : undefined}
                      aria-checked={captain === value}
                      onClick={() => {
                        setCaptain(value);
                        setCaptainError("");
                      }}
                      className="h-12 rounded-md border border-input bg-field text-[15px] font-semibold transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-ink aria-checked:bg-ink aria-checked:text-ink-foreground short:h-11"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p id="captain-hint" className="mt-2 text-sm text-muted-foreground">
                  {captainStatus === "pending"
                    ? "Seu pedido de capitão está aguardando aprovação."
                    : captainStatus === "rejected"
                      ? "Seu pedido anterior foi recusado. Marque Sim para pedir de novo."
                      : "Capitães precisam de aprovação da organização antes de criar a equipe."}
                </p>
                {captainError && (
                  <p id="captain-error" role="alert" className="mt-1 text-sm font-medium text-destructive">
                    {captainError}
                  </p>
                )}
              </fieldset>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="race"
                size="auth"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
                {submitting ? "Salvando..." : "Salvar e continuar"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
