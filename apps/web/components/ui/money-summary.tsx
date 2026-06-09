import { cn } from "@/lib/utils";

export function SummaryLine({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-[clamp(0.875rem,3.5vw,1.0625rem)] font-medium leading-tight text-foreground [overflow-wrap:anywhere] tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function MoneyTotal({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1 border-t border-border pt-4", className)}>
      <p className="text-base font-medium text-foreground">{label}</p>
      <p className="font-display text-[clamp(1.25rem,4.5vw,1.875rem)] font-semibold leading-tight tracking-tight text-foreground [overflow-wrap:anywhere] tabular-nums">
        {value}
      </p>
    </div>
  );
}
