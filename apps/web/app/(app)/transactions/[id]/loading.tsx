import { Card } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

export default function TransactionDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat detail bon">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-9 w-56" />
          <SkeletonBlock className="h-5 w-40" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-32" />
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="border-b border-border px-6 py-5">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 px-6 py-5">
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <SkeletonBlock key={cellIndex} className="h-5 w-24" />
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}
