import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import heroImage from "@/assets/portal-hero-mousetrap-car.jpg";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import type { EventInfo } from "@/lib/portal-content";
import { EVENT_STATUS_LABEL, getCountdown, getEventStatus } from "@/lib/portal-rules";
import { cn } from "@/lib/utils";

const TZ = "America/Sao_Paulo";

export function formatEventDate(iso: string | null) {
  if (!iso) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: TZ }).format(
    new Date(iso),
  );
}

export function formatEventTime(iso: string | null) {
  if (!iso) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function EventHero({ event, compact = false }: { event: EventInfo; compact?: boolean }) {
  const startsAt = event.startsAt ? new Date(event.startsAt) : null;
  const endsAt = event.endsAt ? new Date(event.endsAt) : null;
  const now = useNow(!!startsAt);
  const status = now ? getEventStatus(startsAt, endsAt, now) : startsAt ? "em-breve" : "a-definir";
  const countdown = now ? getCountdown(startsAt, now) : null;

  const facts = [
    { icon: CalendarDays, label: "Data", value: formatEventDate(event.startsAt) },
    { icon: Clock, label: "Horário", value: formatEventTime(event.startsAt) },
    { icon: MapPin, label: "Local", value: event.location ?? "A definir" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
      <img
        src={heroImage}
        alt="Carrinho movido a ratoeira em uma pista de competição"
        width={1920}
        height={1088}
        className="absolute inset-0 -z-20 size-full object-cover object-[70%_center]"
      />
      <div aria-hidden="true" className="bg-hero-overlay absolute inset-0 -z-10" />

      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8",
          compact ? "min-h-[420px] py-14" : "min-h-[560px] py-16 lg:min-h-[640px]",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink-foreground px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink">
            {event.edition}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/35 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", status === "ao-vivo" ? "bg-primary" : "bg-ink-foreground/70")}
            />
            {EVENT_STATUS_LABEL[status]}
          </span>
        </div>

        <h1 className="mt-5 max-w-3xl font-headline text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.9]">
          MouseTrap <span className="block">Car Race</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-ink-foreground/80 sm:text-lg">
          Competição acadêmica de carrinhos movidos a ratoeira. Engenharia, energia elástica e muita velocidade.
        </p>

        <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-lg border border-ink-foreground/20 bg-ink-foreground/20 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-ink/60 px-4 py-3 backdrop-blur-sm">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-ink-foreground/70" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-foreground/60">{label}</dt>
                <dd className="font-display text-base font-bold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {startsAt ? (
          countdown &&
          !countdown.finished && (
            <div className="mt-6 flex gap-2" aria-label="Contagem regressiva">
              {(
                [
                  ["Dias", countdown.days],
                  ["Horas", countdown.hours],
                  ["Min", countdown.minutes],
                  ["Seg", countdown.seconds],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="w-16 rounded-md bg-ink-foreground py-2 text-center text-ink sm:w-20">
                  <p className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="mt-5 text-sm text-ink-foreground/70">
            A contagem regressiva começa assim que a data for anunciada.
          </p>
        )}

        {!compact && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="race" size="auth" className="w-auto px-7">
              <Link to="/evento">
                Programação e informações <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Link
              to="/equipes"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink-foreground/60 px-7 text-[15px] font-bold transition-colors hover:bg-ink-foreground hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground"
            >
              <Users aria-hidden="true" className="size-4" /> Ver equipes
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
