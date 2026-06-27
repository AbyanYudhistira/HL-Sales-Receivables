import { Gift } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: "paid" | "unpaid" | "gift";
  className?: string;
}) {
  const labels = {
    paid: "Sudah Bayar",
    unpaid: "Belum Bayar",
    gift: "Bonus",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium",
        status === "paid" && "bg-success/15 text-success",
        status === "unpaid" && "bg-warning/15 text-warning",
        status === "gift" && "bg-info/15 text-info",
        className
      )}
    >
      {status === "gift" && <Gift className="size-4 shrink-0" aria-hidden />}
      {labels[status]}
    </span>
  );
}

export function GiftBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="info" className={cn("gap-1.5", className)}>
      <Gift className="size-4 shrink-0" aria-hidden />
      {children}
    </Badge>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium",
        variant === "default" && "bg-muted text-foreground",
        variant === "success" && "bg-success/15 text-success",
        variant === "warning" && "bg-warning/15 text-warning",
        variant === "info" && "bg-info/15 text-info",
        className
      )}
    >
      {children}
    </span>
  );
}
