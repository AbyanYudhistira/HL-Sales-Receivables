"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id: string;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex min-h-12 cursor-pointer items-center gap-3 text-base font-medium",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-card transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      {label}
    </label>
  );
}
