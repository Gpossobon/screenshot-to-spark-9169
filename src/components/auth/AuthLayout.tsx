import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import mascot from "@/assets/mouse-racetrap-mascote.png.asset.json";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { RaceTrackArt } from "./RaceTrackArt";

type Mode = "signin" | "signup" | "none";

export function AuthHeader({ mode }: { mode: Mode }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Mouse RaceTrap — página inicial"
        >
          <img
            src={mascot.url}
            alt="Mascote Mouse RaceTrap"
            width={56}
            height={56}
            className="h-11 w-11 object-contain sm:h-14 sm:w-14"
          />
          <span className="hidden font-headline text-lg text-brand sm:block">
            Mouse <span className="text-foreground">RaceTrap</span>
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
    <div className="flex min-h-screen flex-col bg-background">
      <AuthHeader mode={mode} />

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Visual region */}
        <section
          aria-hidden="true"
          className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:w-[46%] lg:items-center lg:justify-center"
        >
          <RaceTrackArt />
          <div className="relative flex flex-col items-center px-10 py-16">
            <img
              src={mascot.url}
              alt=""
              width={420}
              height={420}
              className="animate-mascot-in w-[min(22rem,30vw)] object-contain"
            />
            <p className="relative mt-2 font-headline text-[clamp(2rem,3.4vw,3.25rem)] text-brand">
              Mouse <span className="text-foreground">RaceTrap</span>
            </p>
            <p className="mt-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-0.5 w-8 bg-primary" />
              Energia elástica em movimento
            </p>
          </div>
        </section>

        {/* Auth region */}
        <section className="flex flex-1 justify-center px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:items-center lg:py-16">
          <div className="w-full max-w-[30rem]">
            <h1 className="font-headline text-[clamp(1.85rem,4vw,2.5rem)] text-foreground">
              {title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
