import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";
import { InstitutionalFooter } from "@/components/auth/InstitutionalFooter";
import { cn } from "@/lib/utils";
import type { ContentSource } from "@/lib/portal-content";
import { PortalHeader } from "./PortalHeader";

export function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PortalHeader />
      <main className="flex-1">{children}</main>
      <InstitutionalFooter />
    </div>
  );
}

type SectionLinkTarget = "/evento" | "/equipes" | "/classificacao" | "/resultados" | "/noticias";

export function SectionHeading({
  eyebrow,
  title,
  link,
  source,
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  link?: { to: SectionLinkTarget; label: string };
  source?: ContentSource;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && (
          <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden="true" className="h-0.5 w-6 bg-brand" />
            {eyebrow}
          </p>
        )}
        <Heading className="mt-2 font-headline text-[clamp(1.75rem,4vw,2.75rem)] text-foreground">{title}</Heading>
        {source === "demo" && <DemoNotice className="mt-3" />}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-ink hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
        >
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Marks example content so nobody mistakes it for official information. */
export function DemoNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-dashed border-brand/40 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand",
        className,
      )}
    >
      <Info aria-hidden="true" className="size-3.5 shrink-0" />
      Dados demonstrativos — não são informações oficiais
    </p>
  );
}

export function PortalSection({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "ink";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 sm:py-20",
        tone === "surface" && "border-y border-border bg-surface",
        tone === "ink" && "bg-ink text-ink-foreground",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
