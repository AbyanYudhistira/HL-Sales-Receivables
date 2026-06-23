"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg space-y-4 py-12 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Terjadi kesalahan
      </h1>
      <p className="text-base text-muted-foreground">
        Halaman tidak dapat dimuat. Silakan coba lagi.
      </p>
      <Button size="lg" onClick={reset}>
        Coba lagi
      </Button>
    </Card>
  );
}
