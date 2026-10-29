import { describe, expect, it } from "vitest";
import {
  MAX_TEAM_SIZE,
  canAddMember,
  memberInitials,
  teamStatus,
  translateTeamError,
} from "./team-rules";

describe("team size", () => {
  it("allows at most 5 members, captain included", () => {
    expect(MAX_TEAM_SIZE).toBe(5);
    expect(canAddMember(4)).toBe(true);
    expect(canAddMember(5)).toBe(false);
  });

  it("cannot add members before a team exists", () => {
    expect(canAddMember(0)).toBe(false);
  });
});

describe("team status", () => {
  it("reports no team, open spots and full team", () => {
    expect(teamStatus(0).key).toBe("none");
    expect(teamStatus(3).key).toBe("open");
    expect(teamStatus(5).key).toBe("full");
  });
});

describe("team errors", () => {
  it("explains a member already in another team", () => {
    expect(translateTeamError({ message: "ALREADY_IN_TEAM" })).toMatch(/outra equipe/);
  });

  it("explains a full team", () => {
    expect(translateTeamError({ message: "TEAM_FULL" })).toMatch(/5 integrantes/);
  });
});

describe("initials", () => {
  it("uses first and last name", () => {
    expect(memberInitials("ana maria souza")).toBe("AS");
  });
});
