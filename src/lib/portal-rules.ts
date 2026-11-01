/**
 * Pure rules behind the public portal (standings, countdown, event status).
 * Kept free of UI and data sources so a future API can feed them unchanged.
 */

export type RaceResult = {
  teamSlug: string;
  /** Finishing position in this race (1 = best). */
  position: number;
  points: number;
  /** Recorded mark as shown to people, e.g. "4,82 s" or "12,4 m". */
  mark: string;
};

export type Race = {
  id: string;
  name: string;
  category: string;
  status: "realizada" | "prevista";
  results: RaceResult[];
};

export type StandingRow = {
  teamSlug: string;
  position: number;
  points: number;
  racesCompleted: number;
  /** Top three (with points) get the podium highlight. */
  podium: boolean;
};

/** Championship table: points from completed races only, best first. */
export function buildStandings(teamSlugs: string[], races: Race[]): StandingRow[] {
  const completed = races.filter((r) => r.status === "realizada");
  const rows = teamSlugs.map((teamSlug) => {
    const results = completed.flatMap((r) => r.results.filter((x) => x.teamSlug === teamSlug));
    return {
      teamSlug,
      points: results.reduce((sum, r) => sum + r.points, 0),
      racesCompleted: results.length,
      wins: results.filter((r) => r.position === 1).length,
    };
  });

  rows.sort((a, b) => b.points - a.points || b.wins - a.wins || a.teamSlug.localeCompare(b.teamSlug));

  return rows.map(({ wins: _wins, ...row }, index) => ({
    ...row,
    position: index + 1,
    podium: index < 3 && row.points > 0,
  }));
}

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

/** Time left until `target`; null while the event has no date. */
export function getCountdown(target: Date | null, now: Date): Countdown | null {
  if (!target) return null;
  const diff = Math.max(0, target.getTime() - now.getTime());
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    finished: diff === 0,
  };
}

export type EventStatus = "a-definir" | "em-breve" | "ao-vivo" | "encerrado";

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  "a-definir": "Data a definir",
  "em-breve": "Em breve",
  "ao-vivo": "Acontecendo agora",
  encerrado: "Encerrado",
};

/** Without an end time the event is considered to last until the end of the start day. */
export function getEventStatus(startsAt: Date | null, endsAt: Date | null, now: Date): EventStatus {
  if (!startsAt) return "a-definir";
  if (now < startsAt) return "em-breve";
  const end = endsAt ?? new Date(startsAt.getTime() + 24 * 3600 * 1000);
  return now <= end ? "ao-vivo" : "encerrado";
}
