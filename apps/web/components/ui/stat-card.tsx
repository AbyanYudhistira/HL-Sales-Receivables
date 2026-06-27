import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card } from "./card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
  valueAction,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
  className?: string;
  valueAction?: ReactNode;
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <Icon
        className={cn(
          "absolute right-5 top-5 size-5 opacity-70",
          tone === "default" && "text-primary",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "info" && "text-info"
        )}
        aria-hidden
      />
      <p className="pr-8 text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="font-display text-[clamp(1.125rem,3.5vw,1.5rem)] font-semibold leading-tight tracking-tight text-foreground [overflow-wrap:anywhere] tabular-nums">
          {value}
        </p>
        {valueAction}
      </div>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </Card>
  );
}
