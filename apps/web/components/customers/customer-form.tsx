"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

function DiscountStepsEditor({
  label,
  steps,
  onChange,
}: {
  label: string;
  steps: number[];
  onChange: (steps: number[]) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={step}
              onChange={(e) => {
                const next = [...steps];
                next[index] = Number(e.target.value);
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(steps.filter((_, i) => i !== index))}
            >
              Hapus
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange([...steps, 0])}
        >
          + Tambah Diskon
        </Button>
      </div>
    </div>
  );
}

export function CustomerForm({ action, initial, submitLabel = "Simpan" }: CustomerFormProps) {
  const [discountLm, setDiscountLm] = useState<number[]>(initial?.discountLm ?? []);
  const [discountBr, setDiscountBr] = useState<number[]>(initial?.discountBr ?? []);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="nama">Nama Customer</Label>
        <Input id="nama" name="nama" defaultValue={initial?.nama} required />
      </div>

      <DiscountStepsEditor
        label="Diskon LM (%)"
        steps={discountLm}
        onChange={setDiscountLm}
      />
      <DiscountStepsEditor
        label="Diskon BR (%)"
        steps={discountBr}
        onChange={setDiscountBr}
      />

      <input type="hidden" name="discountLm" value={JSON.stringify(discountLm)} />
      <input type="hidden" name="discountBr" value={JSON.stringify(discountBr)} />

      <div>
        <Label htmlFor="bonusThreshold">Threshold Bonus (Rp)</Label>
        <Input
          id="bonusThreshold"
          name="bonusThreshold"
          type="number"
          min={0}
          defaultValue={initial?.bonusThreshold ?? 0}
          required
        />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
