const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
}

export function parseMonthYear(
  query: { month?: string; year?: string },
  now = new Date()
): { month: number; year: number } {
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  let month = parsePositiveInt(query.month, defaultMonth);
  let year = parsePositiveInt(query.year, defaultYear);

  if (month < 1 || month > 12) month = defaultMonth;
  if (year < MIN_YEAR || year > MAX_YEAR) year = defaultYear;

  return { month, year };
}

export function parsePage(value: string | undefined, fallback = 1): number {
  const parsed = parsePositiveInt(value, fallback);
  return Math.max(1, parsed);
}

export function parseListSearchParams(
  query: { search?: string; page?: string },
  defaultPage = 1
): { search: string; page: number } {
  return {
    search: (query.search ?? "").trim(),
    page: parsePage(query.page, defaultPage),
  };
}
