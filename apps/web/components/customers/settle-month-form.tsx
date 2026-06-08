"use client";

import { useState } from "react";

import { settleMonthAction } from "@/actions/settlement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettleMonthForm({
  customerId,
  year,
  month,
}: {
  customerId: string;
  year: number;
  month: number;
}) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      action={async (formData) => {
        const date = String(formData.get("tanggalPelunasan"));
        const count = await settleMonthAction(customerId, year, month, date);
        setMessage(`${count} transaksi dilunaskan`);
      }}
    >
      <div>
        <Label htmlFor="tanggalPelunasan">Tanggal Pelunasan</Label>
        <Input
          id="tanggalPelunasan"
          name="tanggalPelunasan"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <Button type="submit">Sudah Lunas (Bulan Ini)</Button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </form>
  );
}
