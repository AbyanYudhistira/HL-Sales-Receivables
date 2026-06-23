"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  destructive = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  destructive?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) setConfirming(false);
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-none backdrop:bg-foreground/30"
      onCancel={(event) => {
        event.preventDefault();
        if (!confirming) onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !confirming) {
          onCancel();
        }
      }}
    >
      <h2 id="confirm-dialog-title" className="font-display text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-base text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" disabled={confirming} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={destructive ? "destructive" : "default"}
          disabled={confirming}
          onClick={async () => {
            setConfirming(true);
            try {
              await onConfirm();
            } finally {
              setConfirming(false);
            }
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
