import { describe, expect, it } from "vitest";

import { getReturnTo, isSafeReturnPath } from "@/lib/safe-return-path";

describe("isSafeReturnPath", () => {
  it("allows app routes", () => {
    expect(isSafeReturnPath("/customers")).toBe(true);
    expect(isSafeReturnPath("/transactions/abc")).toBe(true);
  });

  it("rejects external paths", () => {
    expect(isSafeReturnPath("//evil.com")).toBe(false);
    expect(isSafeReturnPath("https://evil.com")).toBe(false);
  });
});

describe("getReturnTo", () => {
  it("returns safe return path from form data", () => {
    const formData = new FormData();
    formData.set("returnTo", "/customers");
    expect(getReturnTo(formData, "/fallback")).toBe("/customers");
  });

  it("falls back when path is unsafe", () => {
    const formData = new FormData();
    formData.set("returnTo", "//evil.com");
    expect(getReturnTo(formData, "/fallback")).toBe("/fallback");
  });
});
