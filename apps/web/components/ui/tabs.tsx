"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  panelIdPrefix = "tab-panel",
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  panelIdPrefix?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`${panelIdPrefix}-${tab.id}`}
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

export function TabPanel({
  id,
  tabId,
  active,
  children,
  className,
  panelIdPrefix = "tab-panel",
}: {
  id: string;
  tabId: string;
  active: string;
  children: React.ReactNode;
  className?: string;
  panelIdPrefix?: string;
}) {
  if (active !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`${panelIdPrefix}-${id}`}
      aria-labelledby={`tab-${tabId}`}
      className={className}
    >
      {children}
    </div>
  );
}
