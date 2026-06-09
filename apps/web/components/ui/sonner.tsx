"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-base text-foreground shadow-none",
          success: "border-success/30 bg-success/10 text-success",
          error: "border-destructive/30 bg-destructive/10 text-destructive",
        },
      }}
    />
  );
}
