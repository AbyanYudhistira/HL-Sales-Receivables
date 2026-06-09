"use client";

export function ToastMessage({
  message,
  tone = "info",
}: {
  message: string | null;
  tone?: "info" | "success" | "error";
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        tone === "success"
          ? "rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-base text-success"
          : tone === "error"
            ? "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
            : "rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground"
      }
    >
      {message}
    </div>
  );
}
