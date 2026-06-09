import { effectiveDiscountPercent } from "@hl/calculations";

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function formatIdr(value: number | string | bigint): string {
  const num = typeof value === "bigint" ? Number(value) : Number(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatMonthYear(month: number, year: number): string {
  const name = INDONESIAN_MONTHS[month - 1] ?? String(month);
  return `${name} ${year}`;
}

export function formatDiscountSteps(steps: number[]): string {
  if (steps.length === 0) return "Tanpa diskon";
  const chain = steps.map((step) => `${step}%`).join(" → ");
  const total = effectiveDiscountPercent(100, steps).toDecimalPlaces(1).toNumber();
  return `${chain} = ${total.toLocaleString("id-ID")}%`;
}

export function parseDiscountSteps(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((step) => Number(step))
    .filter((step) => !Number.isNaN(step) && step >= 0 && step <= 100);
}
