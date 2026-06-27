import { describe, expect, it } from "vitest";

import { formatLabaDisplay } from "@/lib/format-laba";

describe("formatLabaDisplay", () => {
  it("shows formatted amount when visible", () => {
    expect(formatLabaDisplay(1_500_000, true)).toContain("1.500.000");
  });

  it("masks amount when hidden", () => {
    expect(formatLabaDisplay(1_500_000, false)).toBe("••••••");
  });
});
