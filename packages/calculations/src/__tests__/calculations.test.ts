import { describe, expect, it } from "vitest";

import {
  applyCascadingDiscount,
  computeBonusAvailable,
  computeTransactionTotals,
  effectiveDiscountPercent,
} from "../index";

describe("applyCascadingDiscount", () => {
  it("applies cascading discounts correctly (PRD example)", () => {
    const result = applyCascadingDiscount(100, [20, 20, 10]);
    expect(result.toNumber()).toBe(57.6);
  });

  it("returns base price when no discounts", () => {
    expect(applyCascadingDiscount(100, []).toNumber()).toBe(100);
  });

  it("computes effective discount percent", () => {
    const effective = effectiveDiscountPercent(100, [20, 20, 10]);
    expect(effective.toNumber()).toBeCloseTo(42.4, 1);
  });

  it("rejects invalid discount values", () => {
    expect(() => applyCascadingDiscount(100, [101])).toThrow();
  });
});

describe("computeTransactionTotals", () => {
  it("computes line omzet, laba, and amount owed", () => {
    const totals = computeTransactionTotals(
      [
        {
          basePrice: 100000,
          hargaModal: 50000,
          quantity: 2,
          discountSteps: [10],
        },
      ],
      15000,
      true
    );

    expect(totals.transactionOmzet.toNumber()).toBe(180000);
    expect(totals.transactionLaba.toNumber()).toBe(80000);
    expect(totals.amountOwed.toNumber()).toBe(195000);
    expect(totals.ongkir.toNumber()).toBe(15000);
  });

  it("excludes bonus lines from omzet and laba", () => {
    const totals = computeTransactionTotals(
      [
        {
          basePrice: 100000,
          hargaModal: 50000,
          quantity: 1,
          discountSteps: [0],
          isBonusLine: true,
        },
      ],
      0
    );

    expect(totals.transactionOmzet.toNumber()).toBe(0);
    expect(totals.transactionLaba.toNumber()).toBe(0);
  });
});

describe("computeBonusAvailable", () => {
  it("calculates stacked bonuses (PRD example)", () => {
    expect(
      computeBonusAvailable(25_000_000, 10_000_000, 0)
    ).toBe(2);
  });

  it("subtracts already granted bonuses", () => {
    expect(
      computeBonusAvailable(25_000_000, 10_000_000, 1)
    ).toBe(1);
  });

  it("returns 0 when threshold not met", () => {
    expect(
      computeBonusAvailable(5_000_000, 10_000_000, 0)
    ).toBe(0);
  });
});
