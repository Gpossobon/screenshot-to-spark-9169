import { describe, expect, it } from "vitest";
import { canCreateTeam } from "./captain-requests";
import { translateTeamError } from "./team-rules";

describe("captain approval", () => {
  it("only an approved captain can create a team", () => {
    expect(canCreateTeam("approved")).toBe(true);
    expect(canCreateTeam("pending")).toBe(false);
    expect(canCreateTeam("rejected")).toBe(false);
    expect(canCreateTeam(null)).toBe(false);
  });

  it("explains a team creation blocked by a missing approval", () => {
    expect(translateTeamError({ message: "CAPTAIN_NOT_APPROVED" })).toMatch(/aprovado/);
  });
});
