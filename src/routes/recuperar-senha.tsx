import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError, validateEmail } from "@/lib/auth-validation";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha | Mouse RaceTrap" },
      {
        name: "description",
        content: "Receba por e-mail as instruções para redefinir a senha da sua conta Mouse RaceTrap.",
      },
      { property: "og:title", content: "Recuperar senha | Mouse RaceTrap" },
      {
        property: "og:description",
        content: "Informe seu e-mail para receber as instruções de recuperação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecoverPage,
});

function RecoverPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  const emailError = touched ? validateEmail(email) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (validateEmail(email) || submitting) return;
    setSubmitting(true);
    setFormError("");
    setSent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setFormError(translateAuthError(error));
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout
      mode="none"
      title="Recupere sua conta"
      subtitle="Informe seu e-mail para receber as instruções de recuperação."
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        {formError && <FormAlert tone="error">{formError}</FormAlert>}
        {sent && (
          <FormAlert tone="success">
            Solicitação recebida. Se houver uma conta para <strong>{email.trim()}</strong>, você
            receberá um e-mail com o link para criar uma nova senha.
          </FormAlert>
        )}

        <AuthField
          label="E-mail"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Digite seu endereço de e-mail"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={emailError}
        />

        <Button type="submit" variant="race" size="xl" disabled={submitting} aria-busy={submitting}>
          {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitting ? "Enviando..." : "Enviar instruções"}
        </Button>
      </form>

      <div className="mt-10 border-t border-border pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded text-[15px] font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  );
}
