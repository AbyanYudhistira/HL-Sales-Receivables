"use client";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export function LabaVisibilityToggle({
  visible,
  onToggle,
  className,
}: {
  visible: boolean;
  onToggle: (visible: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!visible)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-pressed={visible}
      aria-label={visible ? "Sembunyikan angka laba" : "Tampilkan angka laba"}
    >
      {visible ? (
        <Eye className="size-5" aria-hidden />
      ) : (
        <EyeOff className="size-5" aria-hidden />
      )}
    </button>
  );
}
