import { Card } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

export default function TransactionsLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat penjualan">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SkeletonBlock className="h-9 w-40" />
        <SkeletonBlock className="h-12 w-48" />
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="h-10 w-32" />
      </Card>

      <Card className="p-0">
        <div className="border-b border-border px-6 py-5">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 border-b border-border px-6 py-5 last:border-b-0">
            {Array.from({ length: 6 }).map((__, cellIndex) => (
              <SkeletonBlock key={cellIndex} className="h-5 w-24" />
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}
