"use client";

import { useState } from "react";

import { saveProductAction, updateProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IntegerInput, toIntegerString } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function ProductFormDialog({
  open,
  onClose,
  initial,
  productId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: {
    nama: string;
    hargaModal: number;
    hargaBase: number;
    tipe: "LM" | "BR";
  };
  productId?: string;
  onSaved?: () => void;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [hargaJual, setHargaJual] = useState(toIntegerString(initial?.hargaBase));
  const [hargaModal, setHargaModal] = useState(toIntegerString(initial?.hargaModal));
  const [tipe, setTipe] = useState<"LM" | "BR">(initial?.tipe ?? "LM");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      formData.set("nama", nama);
      formData.set("hargaBase", hargaJual);
      formData.set("hargaModal", hargaModal);
      formData.set("tipe", tipe);
      formData.set("modal", "true");

      const result = productId
        ? await updateProductAction(productId, formData)
        : await saveProductAction(formData);

      if (result && "success" in result && !result.success) {
        showErrorToast(result.error ?? "Gagal menyimpan barang");
        return;
      }

      onSaved?.();
      onClose();
    } catch {
      showErrorToast("Gagal menyimpan barang");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={productId ? "Edit Barang" : "Tambah Barang"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="product-nama">Nama</Label>
          <Input
            id="product-nama"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            required
            className="mt-2"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-base font-medium">Tipe</legend>
          <div className="flex flex-wrap gap-3">
            {(["LM", "BR"] as const).map((value) => (
              <label
                key={value}
                className={cn(
                  "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-4",
                  tipe === value ? "border-primary bg-accent/40" : "border-border"
                )}
              >
                <input
                  type="radio"
                  name="tipe"
                  value={value}
                  checked={tipe === value}
                  onChange={() => setTipe(value)}
                  className="size-4"
                />
                {value === "LM" ? "Logam Mulia (LM)" : "Barang Reguler (BR)"}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="product-jual">Harga Jual (Rp)</Label>
          <IntegerInput
            id="product-jual"
            value={hargaJual}
            onValueChange={setHargaJual}
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="product-modal">Harga Modal (Rp)</Label>
          <IntegerInput
            id="product-modal"
            value={hargaModal}
            onValueChange={setHargaModal}
            required
            className="mt-2"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            Simpan
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
