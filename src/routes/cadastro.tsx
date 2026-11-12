import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormAlert } from "@/components/auth/FormAlert";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { supabase } from "@/integrations/supabase/client";
import {
  isPasswordValid,
  translateAuthError,
  validateEmail,
  validateFullName,
} from "@/lib/auth-validation";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | MouseTrap Car Race" },
      {
        name: "description",
        content:
          "Crie sua conta na MouseTrap Car Race e participe da competição de carrinhos movidos a ratoeira.",
      },
      { property: "og:title", content: "Criar conta | MouseTrap Car Race" },
      {
        property: "og:description",
        content: "Entre para a competição e faça parte da nossa comunidade de corrida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/minha-equipe", replace: true });
  }, [session, navigate]);

  const nameErr = validateFullName(form.name);
  const emailErr = validateEmail(form.email);
  const passwordOk = isPasswordValid(form.password);
  const confirmErr = !form.confirm
    ? "Confirme sua senha."
    : form.confirm !== form.password
      ? "As senhas não coincidem."
      : null;
  const formValid = !nameErr && !emailErr && passwordOk && !confirmErr;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const touch = (key: keyof typeof touched) => () => setTouched((t) => ({ ...t, [key]: true }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!formValid || submitting) return;
    setSubmitting(true);
    setFormError("");
    const email = form.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.name.trim() },
      },
    });
    setSubmitting(false);
    if (error) {
      setFormError(translateAuthError(error));
      return;
    }
    if (data.user && data.user.identities?.length === 0) {
      setFormError("Já existe uma conta com este e-mail. Tente entrar ou recuperar sua senha.");
      return;
    }
    if (data.session) {
      navigate({ to: "/minha-equipe", replace: true });
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <AuthLayout
        mode="signup"
        title="Confirme seu e-mail"
        subtitle="Falta pouco para você entrar na pista."
      >
        <FormAlert tone="success">
          Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o e-mail e clique no
          link para ativar sua conta.
        </FormAlert>
        <p className="mt-4 text-sm text-muted-foreground">
          Não encontrou? Verifique a caixa de spam ou lixo eletrônico.
        </p>
        <Button asChild variant="race" size="auth" className="mt-6">
          <Link to="/">Ir para o login</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      mode="signup"
      title="Entre para a competição"
      subtitle="Crie sua conta e faça parte da nossa comunidade de corrida."
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4 short:space-y-3">
        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <AuthField
          label="Nome completo"
          icon={User}
          name="name"
          autoComplete="name"
          placeholder="Digite seu nome completo"
          required
          maxLength={100}
          value={form.name}
          onChange={set("name")}
          onBlur={touch("name")}
          error={touched.name ? nameErr : null}
        />

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
          value={form.email}
          onChange={set("email")}
          onBlur={touch("email")}
          error={touched.email ? emailErr : null}
        />

        <AuthField
          label="Senha"
          icon={Lock}
          name="new-password"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          required
          revealable
          value={form.password}
          onChange={set("password")}
          onBlur={touch("password")}
          error={touched.password && !passwordOk ? "A senha ainda não atende aos requisitos." : null}
          hint={<PasswordRequirements value={form.password} />}
        />

        <AuthField
          label="Confirmar senha"
          icon={Lock}
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
          required
          revealable
          value={form.confirm}
          onChange={set("confirm")}
          onBlur={touch("confirm")}
          error={touched.confirm || (form.confirm && confirmErr) ? confirmErr : null}
        />

        <Button
          type="submit"
          variant="race"
          size="auth"
          disabled={!formValid || submitting}
          aria-busy={submitting}
        >
          {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>


      <div className="mt-6 border-t border-border pt-4 short:mt-4 short:pt-3 text-[15px] font-semibold text-foreground">
        Já tem uma conta?{" "}
        <Link
          to="/"
          className="rounded text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Entrar
        </Link>
      </div>
    </AuthLayout>
  );
}
