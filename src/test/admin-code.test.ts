import { describe, expect, it } from "vitest";
import { isValidAdminCode } from "@/lib/admin-code";

describe("admin access code", () => {
  it("accepts 777687107", () => {
    expect(isValidAdminCode("777687107", "777687107")).toBe(true);
  });
  it("rejects the old code 2027", () => {
    expect(isValidAdminCode("2027", "777687107")).toBe(false);
  });
  it("rejects everything when no code is configured", () => {
    expect(isValidAdminCode("777687107", undefined)).toBe(false);
  });
});
