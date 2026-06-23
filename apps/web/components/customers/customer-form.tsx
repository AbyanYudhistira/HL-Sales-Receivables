"use client";

import { useState } from "react";

import { DiscountStepsEditor } from "@/components/customers/discount-steps-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntegerInput } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    nama: string;
    discountLm: number[];
    discountBr: number[];
    bonusThreshold: number;
  };
  submitLabel?: string;
  returnTo?: string;
}

export function CustomerForm({
  action,
  initial,
  submitLabel = "Simpan",
  returnTo,
}: CustomerFormProps) {
  const [discountLm, setDiscountLm] = useState<number[]>(initial?.discountLm ?? []);
  const [discountBr, setDiscountBr] = useState<number[]>(initial?.discountBr ?? []);

  return (
    <form action={action} className="space-y-5">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <div>
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" defaultValue={initial?.nama} required className="mt-2" />
      </div>

      <div>
        <Label htmlFor="bonusThreshold">Batas Hadiah (Rp)</Label>
        <IntegerInput
          id="bonusThreshold"
          name="bonusThreshold"
          defaultValue={initial?.bonusThreshold}
          required
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Setiap kelipatan ini, pelanggan dapat 1 hadiah.
        </p>
      </div>

      <DiscountStepsEditor label="Diskon LM" steps={discountLm} onChange={setDiscountLm} />
      <DiscountStepsEditor label="Diskon BR" steps={discountBr} onChange={setDiscountBr} />

      <input type="hidden" name="discountLm" value={JSON.stringify(discountLm)} />
      <input type="hidden" name="discountBr" value={JSON.stringify(discountBr)} />

      <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        Diskon dihitung bertahap. Contoh: 20% lalu 20% lalu 10% = total potongan 42,4%.
      </p>

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
