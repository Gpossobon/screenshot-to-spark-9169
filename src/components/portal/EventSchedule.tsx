import { CalendarDays, Flag, MapPin } from "lucide-react";
import type { EventInfo, ScheduleItem, Sourced } from "@/lib/portal-content";
import { DemoNotice } from "./PortalLayout";
import { formatEventDate, formatEventTime } from "./EventHero";

export function EventSchedule({ event, schedule }: { event: EventInfo; schedule: Sourced<ScheduleItem[]> }) {
  const stages = schedule.items.filter((i) => i.stage === "Classificatória").length;
  const startLabel = event.startsAt
    ? `${formatEventDate(event.startsAt)} · ${formatEventTime(event.startsAt)}`
    : "A definir";

  const quick = [
    { icon: CalendarDays, label: "Data e início", value: startLabel },
    { icon: MapPin, label: "Localização", value: event.location ?? "A definir" },
    { icon: Flag, label: "Etapas classificatórias", value: stages ? `${stages} provas + final` : "A definir" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div className="grid gap-3 self-start sm:grid-cols-3 lg:grid-cols-1">
        {quick.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-bold uppercase tracking-wide">Cronograma de atividades</h3>
          {schedule.source === "demo" && <DemoNotice />}
        </div>
        <ol>
          {schedule.items.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[6rem_1fr_auto] sm:items-center"
            >
              <span className="font-display text-sm font-bold tabular-nums text-muted-foreground">
                {item.time ?? "A definir"}
              </span>
              <div>
                <p className="flex items-center gap-2 font-bold">
                  <span className="text-xs text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
              {item.stage && (
                <span className="col-start-2 justify-self-start rounded-full bg-pill px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider sm:col-start-auto">
                  {item.stage}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
