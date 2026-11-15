import { describe, expect, it } from "vitest";
import { ADMIN_EMAIL, maskEmail } from "@/lib/admin-email";

describe("admin account", () => {
  it("sends password resets to the owner's email", () => {
    expect(ADMIN_EMAIL).toBe("mohammedqumash3@gmail.com");
  });
  it("hides most of the address on screen", () => {
    expect(maskEmail("mohammedqumash3@gmail.com")).toBe("moh***@gmail.com");
  });
});
