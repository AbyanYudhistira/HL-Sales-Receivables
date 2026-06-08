import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
        variant === "secondary" &&
          "border border-[var(--border)] bg-white hover:bg-[var(--muted)]",
        variant === "danger" && "bg-[var(--danger)] text-white hover:opacity-90",
        variant === "ghost" && "hover:bg-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}
