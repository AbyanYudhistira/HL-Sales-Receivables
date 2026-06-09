"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentDateDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (date: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p className="text-base text-muted-foreground">{description}</p>
      <div className="mt-4">
        <Label htmlFor="payment-date">Tanggal pembayaran</Label>
        <Input
          id="payment-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-2"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await onConfirm(date);
            } finally {
              setLoading(false);
            }
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
