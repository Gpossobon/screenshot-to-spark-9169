import { describe, expect, it } from "vitest";
import { buildStandings, getCountdown, getEventStatus, type Race } from "./portal-rules";

const races: Race[] = [
  {
    id: "p1",
    name: "Prova 1",
    category: "Distância",
    status: "realizada",
    results: [
      { teamSlug: "a", position: 1, points: 10, mark: "" },
      { teamSlug: "b", position: 2, points: 8, mark: "" },
      { teamSlug: "c", position: 3, points: 6, mark: "" },
      { teamSlug: "d", position: 4, points: 5, mark: "" },
    ],
  },
  {
    id: "p2",
    name: "Prova 2",
    category: "Velocidade",
    status: "realizada",
    results: [
      { teamSlug: "b", position: 1, points: 10, mark: "" },
      { teamSlug: "a", position: 2, points: 8, mark: "" },
      { teamSlug: "d", position: 3, points: 6, mark: "" },
      { teamSlug: "c", position: 4, points: 5, mark: "" },
    ],
  },
  {
    id: "final",
    name: "Final",
    category: "Final",
    status: "prevista",
    results: [{ teamSlug: "d", position: 1, points: 100, mark: "" }],
  },
];

describe("buildStandings", () => {
  it("sums points from completed races only, best first", () => {
    const rows = buildStandings(["a", "b", "c", "d"], races);
    expect(rows.map((r) => [r.teamSlug, r.points])).toEqual([
      ["a", 18],
      ["b", 18],
      ["c", 11],
      ["d", 11],
    ]);
  });

  it("breaks ties by number of race wins", () => {
    const rows = buildStandings(["b", "a"], races.slice(0, 2));
    // a and b both have 18 points and 1 win each → alphabetical fallback.
    expect(rows[0]?.teamSlug).toBe("a");
  });

  it("highlights only the top three as podium", () => {
    const rows = buildStandings(["a", "b", "c", "d"], races);
    expect(rows.map((r) => r.podium)).toEqual([true, true, true, false]);
  });

  it("never highlights teams without points", () => {
    const rows = buildStandings(["a", "b"], []);
    expect(rows.every((r) => !r.podium && r.points === 0 && r.racesCompleted === 0)).toBe(true);
  });
});

describe("getCountdown", () => {
  it("is hidden while the event has no date", () => {
    expect(getCountdown(null, new Date())).toBeNull();
  });

  it("splits the remaining time into days, hours, minutes and seconds", () => {
    const now = new Date("2026-11-01T12:00:00Z");
    const target = new Date("2026-11-03T15:04:05Z");
    expect(getCountdown(target, now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      finished: false,
    });
  });

  it("stops at zero once the start time has passed", () => {
    const c = getCountdown(new Date("2026-11-01T00:00:00Z"), new Date("2026-11-02T00:00:00Z"));
    expect(c?.finished).toBe(true);
    expect(c?.days).toBe(0);
  });
});

describe("getEventStatus", () => {
  const start = new Date("2026-11-20T13:00:00Z");
  const end = new Date("2026-11-20T21:00:00Z");

  it("shows 'a definir' without a date", () => {
    expect(getEventStatus(null, null, new Date())).toBe("a-definir");
  });
  it("is upcoming before the start", () => {
    expect(getEventStatus(start, end, new Date("2026-11-19T00:00:00Z"))).toBe("em-breve");
  });
  it("is live between start and end", () => {
    expect(getEventStatus(start, end, new Date("2026-11-20T15:00:00Z"))).toBe("ao-vivo");
  });
  it("is finished after the end", () => {
    expect(getEventStatus(start, end, new Date("2026-11-20T22:00:00Z"))).toBe("encerrado");
  });
});
