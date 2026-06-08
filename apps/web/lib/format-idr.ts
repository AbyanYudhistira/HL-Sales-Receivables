export function formatIdr(value: number | string | bigint): string {
  const num = typeof value === "bigint" ? Number(value) : Number(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function parseDiscountSteps(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((step) => Number(step))
    .filter((step) => !Number.isNaN(step) && step >= 0 && step <= 100);
}
