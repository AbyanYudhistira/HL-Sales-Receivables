import { Card } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Memuat halaman">
      <header className="space-y-2">
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="h-5 w-48" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-3">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-8 w-40" />
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4 sm:flex-row">
        <SkeletonBlock className="h-14 flex-1" />
        <SkeletonBlock className="h-14 flex-1" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-5 w-24" />
        </div>
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <Card className="flex items-center justify-between gap-3 py-5">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-5 w-36" />
                </div>
                <SkeletonBlock className="h-6 w-24" />
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
