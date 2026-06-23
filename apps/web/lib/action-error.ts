import { ZodError } from "zod";

export function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    return error.errors[0]?.message ?? fallback;
  }
  if (error instanceof SyntaxError) {
    return "Format data tidak valid";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function parseJsonArrayFromForm(formData: FormData, field: string): unknown {
  const raw = String(formData.get(field) ?? "[]");
  try {
    return JSON.parse(raw);
  } catch {
    throw new SyntaxError(`Field ${field} tidak valid`);
  }
}
