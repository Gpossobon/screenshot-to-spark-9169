import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormAlert } from "@/components/auth/FormAlert";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isPasswordValid, translateAuthError } from "@/lib/auth-validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha | Mouse RaceTrap" },
      { name: "description", content: "Defina uma nova senha para sua conta Mouse RaceTrap." },
      { property: "og:title", content: "Nova senha | Mouse RaceTrap" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady("ok");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady("ok");
      else if (!isRecovery) setReady("invalid");
    });
    const timer = window.setTimeout(() => {
      setReady((r) => (r === "checking" ? "invalid" : r));
    }, 4000);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const passwordOk = isPasswordValid(password);
  const confirmErr = !confirm
    ? "Confirme sua nova senha."
    : confirm !== password
      ? "As senhas não coincidem."
      : null;
  const valid = passwordOk && !confirmErr;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || submitting) return;
    setSubmitting(true);
    setFormError("");
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setFormError(translateAuthError(error));
      return;
    }
    navigate({ to: "/painel", replace: true });
  }

  return (
    <AuthLayout
      mode="none"
      title="Crie uma nova senha"
      subtitle="Escolha uma senha nova para voltar à pista."
    >
      {ready === "checking" && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Verificando o link...
        </p>
      )}

      {ready === "invalid" && (
        <div className="space-y-4 short:space-y-3">
          <FormAlert tone="error">
            Este link de recuperação é inválido ou expirou. Solicite um novo link.
          </FormAlert>
          <Button asChild variant="race" size="auth">
            <Link to="/recuperar-senha">Solicitar novo link</Link>
          </Button>
        </div>
      )}

      {ready === "ok" && (
        <form noValidate onSubmit={handleSubmit} className="space-y-4 short:space-y-3">
          {formError && <FormAlert tone="error">{formError}</FormAlert>}
          <AuthField
            label="Nova senha"
            icon={Lock}
            name="new-password"
            autoComplete="new-password"
            placeholder="Digite a nova senha"
            required
            revealable
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !passwordOk ? "A senha ainda não atende aos requisitos." : null}
            hint={<PasswordRequirements value={password} />}
          />
          <AuthField
            label="Confirmar nova senha"
            icon={Lock}
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Digite a nova senha novamente"
            required
            revealable
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={touched || confirm ? confirmErr : null}
          />
          <Button
            type="submit"
            variant="race"
            size="auth"
            disabled={!valid || submitting}
            aria-busy={submitting}
          >
            {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {submitting ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
