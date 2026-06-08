import Decimal from "decimal.js";

export function computeBonusAvailable(
  accumulatedPaidOmzet: number | string | Decimal,
  bonusThreshold: number | string | Decimal,
  bonusesAlreadyGranted: number
): number {
  const accumulator = new Decimal(accumulatedPaidOmzet);
  const threshold = new Decimal(bonusThreshold);

  if (threshold.isZero() || threshold.isNegative()) {
    return 0;
  }

  const earned = accumulator.div(threshold).floor().toNumber();
  return Math.max(0, earned - bonusesAlreadyGranted);
}

export function computeOmzetConsumedByBonuses(
  bonusCount: number,
  bonusThreshold: number | string | Decimal
): Decimal {
  return new Decimal(bonusThreshold).mul(bonusCount);
}
