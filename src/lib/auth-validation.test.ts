import { describe, expect, it } from "vitest";
import { checkPassword, isPasswordValid, validateEmail } from "./auth-validation";

describe("password rules", () => {
  it("requires at least 7 characters", () => {
    expect(checkPassword("abc123").length).toBe(false);
    expect(checkPassword("abcd123").length).toBe(true);
  });

  it("requires at least one letter", () => {
    expect(isPasswordValid("1234567")).toBe(false);
  });

  it("requires at least one number", () => {
    expect(isPasswordValid("abcdefg")).toBe(false);
  });

  it("does not require special characters", () => {
    expect(isPasswordValid("corrida1")).toBe(true);
  });
});

describe("email validation", () => {
  it("rejects a malformed address", () => {
    expect(validateEmail("piloto@")).not.toBeNull();
  });

  it("accepts a valid address", () => {
    expect(validateEmail("piloto@exemplo.com")).toBeNull();
  });
});
