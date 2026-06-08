import Decimal from "decimal.js";

export function applyCascadingDiscount(
  basePrice: number | string | Decimal,
  discountSteps: number[]
): Decimal {
  let price = new Decimal(basePrice);

  for (const step of discountSteps) {
    if (step < 0 || step > 100) {
      throw new Error(`Diskon harus antara 0 dan 100, dapat: ${step}`);
    }
    price = price.mul(new Decimal(1).minus(new Decimal(step).div(100)));
  }

  return price;
}

export function effectiveDiscountPercent(
  basePrice: number | string | Decimal,
  discountSteps: number[]
): Decimal {
  const base = new Decimal(basePrice);
  if (base.isZero()) return new Decimal(0);

  const discounted = applyCascadingDiscount(base, discountSteps);
  return new Decimal(1).minus(discounted.div(base)).mul(100);
}
