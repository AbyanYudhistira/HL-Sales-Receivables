"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveCustomerAction, updateCustomerAction } from "@/actions/customers";
import { DiscountStepsEditor } from "@/components/customers/discount-steps-editor";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IntegerInput, toIntegerString } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function CustomerFormDialog({
  open,
  onClose,
  initial,
  customerId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: {
    nama: string;
    discountLm: number[];
    discountBr: number[];
    bonusThreshold: number;
  };
  customerId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [discountLm, setDiscountLm] = useState<number[]>(initial?.discountLm ?? []);
  const [discountBr, setDiscountBr] = useState<number[]>(initial?.discountBr ?? []);
  const [bonusThreshold, setBonusThreshold] = useState(
    toIntegerString(initial?.bonusThreshold)
  );
  const [namaError, setNamaError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nama.trim()) {
      setNamaError("Nama wajib diisi.");
      return;
    }
    setNamaError(null);

    const formData = new FormData();
    formData.set("nama", nama.trim());
    formData.set("discountLm", JSON.stringify(discountLm));
    formData.set("discountBr", JSON.stringify(discountBr));
    formData.set("bonusThreshold", bonusThreshold);
    formData.set("modal", "true");

    startTransition(async () => {
      try {
        const result = customerId
          ? await updateCustomerAction(customerId, formData)
          : await saveCustomerAction(formData);

        if (result && "success" in result && !result.success) {
          showErrorToast(result.error ?? "Gagal menyimpan pelanggan");
          return;
        }

        showSuccessToast("Pelanggan disimpan.");
        router.refresh();
        onClose();
      } catch {
        showErrorToast("Gagal menyimpan pelanggan");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={customerId ? "Edit Pelanggan" : "Tambah Pelanggan"}
      className="w-[min(100%-2rem,36rem)]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="customer-nama">Nama</Label>
          <Input
            id="customer-nama"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            aria-invalid={!!namaError}
            aria-describedby={namaError ? "customer-nama-error" : undefined}
            className="mt-2"
          />
          {namaError && (
            <p id="customer-nama-error" className="mt-2 text-sm text-destructive">
              {namaError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="customer-bonus">Batas Bonus (Rp)</Label>
          <IntegerInput
            id="customer-bonus"
            value={bonusThreshold}
            onValueChange={setBonusThreshold}
            required
            className="mt-2"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Setiap kelipatan ini, pelanggan dapat 1 bonus.
          </p>
        </div>

        <DiscountStepsEditor label="Diskon LM" steps={discountLm} onChange={setDiscountLm} />
        <DiscountStepsEditor label="Diskon BR" steps={discountBr} onChange={setDiscountBr} />

        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Diskon dihitung bertahap. Contoh: 20% lalu 20% lalu 10% = total potongan 42,4%.
        </p>

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
