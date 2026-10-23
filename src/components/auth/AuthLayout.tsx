import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import mascot from "@/assets/mouse-racetrap-mascote.png.asset.json";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { RaceTrackArt } from "./RaceTrackArt";

type Mode = "signin" | "signup" | "none";

export function AuthHeader({ mode }: { mode: Mode }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-8 lg:h-20 lg:short:h-16">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MouseTrap Car Race — página inicial"
        >
          <img
            src={mascot.url}
            alt="Mascote MouseTrap Car Race"
            width={56}
            height={56}
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12 lg:h-14 lg:w-14 lg:short:h-12 lg:short:w-12"
          />
          <span className="hidden whitespace-nowrap font-headline text-base text-brand sm:block lg:text-lg">
            MouseTrap <span className="text-foreground">Car Race</span>
          </span>
        </Link>

        {mode !== "none" && (
          <nav aria-label="Acesso" className="flex rounded-full bg-pill p-1">
            <Link
              to="/cadastro"
              aria-current={mode === "signup" ? "page" : undefined}
              className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-ink aria-[current=page]:text-ink-foreground sm:px-5"
            >
              Criar conta
            </Link>
            <Link
              to="/"
              aria-current={mode === "signin" ? "page" : undefined}
              className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-ink aria-[current=page]:text-ink-foreground sm:px-5"
            >
              Entrar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function AuthLayout({
  mode,
  title,
  subtitle,
  children,
}: {
  mode: Mode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-viewport flex flex-col bg-background">
      <AuthHeader mode={mode} />

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Visual region */}
        <section
          aria-hidden="true"
          className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:w-[46%] lg:items-center lg:justify-center"
        >
          <RaceTrackArt />
          <div className="relative flex flex-col items-center px-10 py-8">
            <img
              src={mascot.url}
              alt=""
              width={420}
              height={420}
              className="animate-mascot-in w-[min(22rem,30vw,44vh)] object-contain"
            />
            <p className="relative -mt-1 whitespace-nowrap text-center font-headline text-[clamp(1.75rem,2.7vw,2.75rem)] leading-none text-brand">
              MouseTrap <span className="text-foreground">Car Race</span>
            </p>
            <p className="mt-2.5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-0.5 w-8 bg-primary" />
              Energia elástica em movimento
            </p>
          </div>
        </section>

        {/* Auth region */}
        <section className="flex flex-1 items-center justify-center px-5 py-5 sm:px-8 sm:py-8 short:py-3">
          <div className="w-full max-w-[30rem]">
            <h1 className="font-headline text-[clamp(1.85rem,4vw,2.5rem)] text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
            <div className="mt-6 short:mt-3">{children}</div>
          </div>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
