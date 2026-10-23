import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormAlert } from "@/components/auth/FormAlert";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError, validateEmail } from "@/lib/auth-validation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar | Mouse RaceTrap" },
      {
        name: "description",
        content:
          "Acesse sua conta na plataforma Mouse RaceTrap e prepare-se para a próxima corrida de carrinhos movidos a ratoeira.",
      },
      { property: "og:title", content: "Entrar | Mouse RaceTrap" },
      {
        property: "og:description",
        content: "Acesse sua conta e prepare-se para a próxima corrida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (session) navigate({ to: "/painel", replace: true });
  }, [session, navigate]);

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password && !password ? "Informe sua senha." : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (validateEmail(email) || !password || submitting) return;
    setSubmitting(true);
    setFormError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      setFormError(translateAuthError(error));
      return;
    }
    navigate({ to: "/painel", replace: true });
  }

  return (
    <AuthLayout
      mode="signin"
      title="Acesse sua conta"
      subtitle="Entre na plataforma e prepare-se para a próxima corrida."
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <AuthField
          label="E-mail"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Digite seu endereço de e-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
        />

        <div className="space-y-3">
          <AuthField
            label="Senha"
            icon={Lock}
            name="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            revealable
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordError}
          />
          <Link
            to="/recuperar-senha"
            className="inline-block rounded text-sm font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit" variant="race" size="xl" disabled={submitting} aria-busy={submitting}>
          {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <OrDivider />
      <GoogleButton label="Continuar com Google" onError={setFormError} />

      <div className="mt-10 border-t border-border pt-6 text-[15px] font-semibold text-foreground">
        Ainda não tem uma conta?{" "}
        <Link
          to="/cadastro"
          className="rounded text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Criar conta
        </Link>
      </div>
    </AuthLayout>
  );
}
