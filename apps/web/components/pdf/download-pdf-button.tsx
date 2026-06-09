"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function DownloadPdfButton({
  href,
  filename,
  children = "Unduh PDF",
  className,
  size = "lg",
  variant = "outline",
}: {
  href: string;
  filename: string;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(href);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      showErrorToast("Gagal mengunduh PDF. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(className)}
      disabled={loading}
      onClick={handleDownload}
    >
      {loading ? "Menyiapkan PDF..." : children}
    </Button>
  );
}
