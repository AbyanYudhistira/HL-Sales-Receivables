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

export function computeBonusProgress(
  accumulatedPaidOmzet: number | string | Decimal,
  bonusThreshold: number | string | Decimal
): { progressAmount: number; remainingAmount: number; percent: number } {
  const threshold = new Decimal(bonusThreshold);

  if (threshold.isZero() || threshold.isNegative()) {
    return { progressAmount: 0, remainingAmount: 0, percent: 0 };
  }

  const accumulator = new Decimal(accumulatedPaidOmzet);
  const progressAmount = accumulator.mod(threshold).toNumber();
  const remainingAmount = threshold.minus(progressAmount).toNumber();
  const percent = threshold.isZero()
    ? 0
    : new Decimal(progressAmount).div(threshold).mul(100).toNumber();

  return { progressAmount, remainingAmount, percent };
}
