import { describe, expect, it } from "vitest";

import {
  formatDiscountSteps,
  formatIdr,
  formatMonthYear,
  parseDiscountSteps,
} from "@/lib/format-idr";

describe("formatIdr", () => {
  it("formats IDR without decimals", () => {
    expect(formatIdr(1500000)).toContain("1.500.000");
  });
});

describe("parseDiscountSteps", () => {
  it("parses valid discount arrays", () => {
    expect(parseDiscountSteps([20, 10])).toEqual([20, 10]);
  });

  it("returns empty array for invalid input", () => {
    expect(parseDiscountSteps("invalid")).toEqual([]);
  });
});

describe("formatDiscountSteps", () => {
  it("shows chain for non-empty steps", () => {
    expect(formatDiscountSteps([20, 10])).toContain("20%");
  });

  it("shows fallback for empty steps", () => {
    expect(formatDiscountSteps([])).toBe("Tanpa diskon");
  });
});

describe("formatMonthYear", () => {
  it("formats Indonesian month name", () => {
    expect(formatMonthYear(6, 2026)).toBe("Juni 2026");
  });
});
