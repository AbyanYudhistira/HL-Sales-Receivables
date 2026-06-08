import Decimal from "decimal.js";

import { applyCascadingDiscount } from "./discount";

export interface LineInput {
  basePrice: number | string | Decimal;
  hargaModal: number | string | Decimal;
  quantity: number;
  discountSteps: number[];
  isBonusLine?: boolean;
}

export interface ComputedLine {
  discountedUnitPrice: Decimal;
  lineOmzet: Decimal;
  lineLaba: Decimal;
  quantity: number;
  isBonusLine: boolean;
}

export interface TransactionTotals {
  lines: ComputedLine[];
  transactionOmzet: Decimal;
  transactionLaba: Decimal;
  ongkir: Decimal;
  amountOwed: Decimal;
}

export function computeLine(
  input: LineInput,
  roundToRupiah = true
): ComputedLine {
  const quantity = input.quantity;
  const isBonusLine = input.isBonusLine ?? false;

  if (isBonusLine) {
    return {
      discountedUnitPrice: new Decimal(0),
      lineOmzet: new Decimal(0),
      lineLaba: new Decimal(0),
      quantity,
      isBonusLine: true,
    };
  }

  const discountedUnitPrice = roundToRupiah
    ? applyCascadingDiscount(input.basePrice, input.discountSteps).toDecimalPlaces(0)
    : applyCascadingDiscount(input.basePrice, input.discountSteps);

  const lineOmzet = discountedUnitPrice.mul(quantity);
  const lineLaba = discountedUnitPrice
    .minus(new Decimal(input.hargaModal))
    .mul(quantity);

  return {
    discountedUnitPrice,
    lineOmzet,
    lineLaba,
    quantity,
    isBonusLine: false,
  };
}

export function computeTransactionTotals(
  lines: LineInput[],
  ongkir: number | string | Decimal = 0,
  roundToRupiah = true
): TransactionTotals {
  const computedLines = lines.map((line) => computeLine(line, roundToRupiah));

  const transactionOmzet = computedLines.reduce(
    (sum, line) => sum.plus(line.lineOmzet),
    new Decimal(0)
  );

  const transactionLaba = computedLines.reduce(
    (sum, line) => sum.plus(line.lineLaba),
    new Decimal(0)
  );

  const ongkirDecimal = new Decimal(ongkir);
  const amountOwed = transactionOmzet.plus(ongkirDecimal);

  return {
    lines: computedLines,
    transactionOmzet,
    transactionLaba,
    ongkir: ongkirDecimal,
    amountOwed,
  };
}

export function computeLineOmzet(
  discountedUnitPrice: number | string | Decimal,
  quantity: number
): Decimal {
  return new Decimal(discountedUnitPrice).mul(quantity);
}

export function computeLaba(
  discountedUnitPrice: number | string | Decimal,
  hargaModal: number | string | Decimal,
  quantity: number
): Decimal {
  return new Decimal(discountedUnitPrice)
    .minus(new Decimal(hargaModal))
    .mul(quantity);
}
