"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntegerInput } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    nama: string;
    hargaModal: number;
    hargaBase: number;
    tipe: "LM" | "BR";
  };
  submitLabel?: string;
  returnTo?: string;
}

export function ProductForm({
  action,
  initial,
  submitLabel = "Simpan",
  returnTo = "/products",
}: ProductFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div>
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" defaultValue={initial?.nama} required className="mt-2" />
      </div>

      <fieldset>
        <legend className="mb-2 text-base font-medium">Tipe</legend>
        <div className="flex flex-wrap gap-3">
          {(["LM", "BR"] as const).map((value) => (
            <label
              key={value}
              className={cn(
                "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-4",
                (initial?.tipe ?? "LM") === value && !initial
                  ? "border-primary bg-accent/40"
                  : "border-border"
              )}
            >
              <input
                type="radio"
                name="tipe"
                value={value}
                defaultChecked={(initial?.tipe ?? "LM") === value}
                className="size-4"
              />
              {value === "LM" ? "Logam Mulia (LM)" : "Barang Reguler (BR)"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="hargaBase">Harga Jual (Rp)</Label>
        <IntegerInput
          id="hargaBase"
          name="hargaBase"
          defaultValue={initial?.hargaBase}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="hargaModal">Harga Modal (Rp)</Label>
        <IntegerInput
          id="hargaModal"
          name="hargaModal"
          defaultValue={initial?.hargaModal}
          required
          className="mt-2"
        />
      </div>

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
