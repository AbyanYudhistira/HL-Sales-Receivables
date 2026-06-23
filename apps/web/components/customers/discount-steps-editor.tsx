"use client";

import { Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IntegerInput, toIntegerString } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";

export function DiscountStepsEditor({
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
            <IntegerInput
              value={toIntegerString(step)}
              aria-label={`${label} tingkat ${index + 1}`}
              onValueChange={(value) => {
                const next = [...steps];
                next[index] = Math.min(100, Number(value || 0));
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus tingkat ${index + 1}`}
              onClick={() => onChange(steps.filter((_, i) => i !== index))}
            >
              <Minus className="size-5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => onChange([...steps, 0])}>
          + Tambah tingkat diskon
        </Button>
      </div>
    </div>
  );
}
