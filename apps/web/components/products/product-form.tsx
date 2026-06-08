"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    nama: string;
    hargaModal: number;
    hargaBase: number;
    tipe: "LM" | "BR";
  };
  submitLabel?: string;
}

export function ProductForm({ action, initial, submitLabel = "Simpan" }: ProductFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="nama">Nama Produk</Label>
        <Input id="nama" name="nama" defaultValue={initial?.nama} required />
      </div>
      <div>
        <Label htmlFor="hargaModal">Harga Modal (Rp)</Label>
        <Input
          id="hargaModal"
          name="hargaModal"
          type="number"
          min={0}
          defaultValue={initial?.hargaModal}
          required
        />
      </div>
      <div>
        <Label htmlFor="hargaBase">Harga Base / Jual (Rp)</Label>
        <Input
          id="hargaBase"
          name="hargaBase"
          type="number"
          min={0}
          defaultValue={initial?.hargaBase}
          required
        />
      </div>
      <div>
        <Label htmlFor="tipe">Tipe</Label>
        <select
          id="tipe"
          name="tipe"
          defaultValue={initial?.tipe ?? "LM"}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="LM">LM</option>
          <option value="BR">BR</option>
        </select>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
