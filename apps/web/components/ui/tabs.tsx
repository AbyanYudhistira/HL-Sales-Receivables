"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "min-h-12 rounded-xl px-5 text-base font-medium transition-[color,box-shadow]",
            active === tab.id
              ? "bg-primary text-primary-foreground shadow-button"
              : "bg-muted text-foreground shadow-button-outline hover:bg-accent/60"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
