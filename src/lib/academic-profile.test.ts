import { describe, expect, it } from "vitest";
import { isAcademicProfileComplete, validateAcademicProfile } from "./academic-profile";

const valid = { full_name: "Ana Souza", ra: "00123", campus: "Zona Sul", turma: "ENG-3A" };

describe("academic profile validation", () => {
  it("requires full name", () => {
    const r = validateAcademicProfile({ ...valid, full_name: "   " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.full_name).toBeDefined();
  });

  it("requires RA", () => {
    const r = validateAcademicProfile({ ...valid, ra: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.ra).toBeDefined();
  });

  it("requires campus", () => {
    const r = validateAcademicProfile({ ...valid, campus: " " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.campus).toBeDefined();
  });

  it("requires turma", () => {
    const r = validateAcademicProfile({ ...valid, turma: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.turma).toBeDefined();
  });

  it("trims surrounding spaces and keeps RA leading zeros", () => {
    const r = validateAcademicProfile({
      full_name: "  Ana Souza ",
      ra: " 000987 ",
      campus: " Zona Sul ",
      turma: " ENG-3A ",
    });
    expect(r.ok && r.data).toEqual({
      full_name: "Ana Souza",
      ra: "000987",
      campus: "Zona Sul",
      turma: "ENG-3A",
    });
  });

  it("accepts free-text campus and turma", () => {
    const r = validateAcademicProfile({ ...valid, campus: "Campus Fapa (noite)", turma: "2026/1 - turma B" });
    expect(r.ok).toBe(true);
  });
});

describe("profile completeness", () => {
  it("is incomplete when nothing is saved", () => {
    expect(isAcademicProfileComplete(null)).toBe(false);
  });

  it("is complete when every field is filled", () => {
    expect(isAcademicProfileComplete(valid)).toBe(true);
  });
});
