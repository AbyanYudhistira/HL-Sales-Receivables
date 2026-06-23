import { describe, expect, it } from "vitest";

import { parseListSearchParams, parseMonthYear, parsePage } from "@/lib/parse-search-params";

describe("parseMonthYear", () => {
  it("falls back for invalid month/year", () => {
    const now = new Date(2026, 5, 15);
    expect(parseMonthYear({ month: "foo", year: "bar" }, now)).toEqual({
      month: 6,
      year: 2026,
    });
  });

  it("clamps invalid month", () => {
    expect(parseMonthYear({ month: "13", year: "2026" }, new Date(2026, 0, 1))).toEqual({
      month: 1,
      year: 2026,
    });
  });
});

describe("parsePage", () => {
  it("returns at least 1", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });
});

describe("parseListSearchParams", () => {
  it("trims search and parses page", () => {
    expect(parseListSearchParams({ search: "  abc ", page: "2" })).toEqual({
      search: "abc",
      page: 2,
    });
  });
});
