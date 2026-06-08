"use client";

import { applyCascadingDiscount, computeTransactionTotals } from "@hl/calculations";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatIdr, parseDiscountSteps } from "@/lib/format-idr";

interface ProductOption {
  id: string;
  nama: string;
  tipe: "LM" | "BR";
  hargaBase: number;
  hargaModal: number;
}

interface CustomerOption {
  id: string;
  nama: string;
  discountLm: unknown;
  discountBr: unknown;
}

interface LineState {
  productId: string;
  quantity: number;
}

interface TransactionFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string } | void>;
  customers: CustomerOption[];
  products: ProductOption[];
  initial?: {
    tanggal: string;
    nomorBon: string;
    customerId: string;
    ongkir: number;
    deskripsi?: string;
    isBonus: boolean;
    status: "PIUTANG" | "LUNAS";
    lines: LineState[];
    bonusCount?: number;
  };
}

export function TransactionForm({
  action,
  customers,
  products,
  initial,
}: TransactionFormProps) {
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [lines, setLines] = useState<LineState[]>(
    initial?.lines ?? [{ productId: "", quantity: 1 }]
  );
  const [ongkir, setOngkir] = useState(initial?.ongkir ?? 0);
  const [isBonus, setIsBonus] = useState(initial?.isBonus ?? false);
  const [error, setError] = useState<string | null>(null);

  const customer = customers.find((c) => c.id === customerId);

  const preview = useMemo(() => {
    if (!customer) return null;

    const lineInputs = lines
      .filter((l) => l.productId)
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        const steps = parseDiscountSteps(
          product.tipe === "LM" ? customer.discountLm : customer.discountBr
        );
        return {
          basePrice: product.hargaBase,
          hargaModal: product.hargaModal,
          quantity: line.quantity,
          discountSteps: steps,
          isBonusLine: isBonus,
        };
      })
      .filter(Boolean) as Parameters<typeof computeTransactionTotals>[0];

    if (lineInputs.length === 0) return null;
    return computeTransactionTotals(lineInputs, ongkir);
  }, [customer, lines, ongkir, isBonus, products]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("customerId", customerId);
    formData.set("isBonus", String(isBonus));
    formData.set(
      "lines",
      JSON.stringify(
        lines
          .filter((l) => l.productId)
          .map((l) => ({ ...l, isBonusLine: isBonus }))
      )
    );
    const result = await action(formData);
    if (result && "success" in result && !result.success) {
      setError(result.error ?? "Gagal menyimpan");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            defaultValue={initial?.tanggal ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div>
          <Label htmlFor="nomorBon">Nomor Bon</Label>
          <Input
            id="nomorBon"
            name="nomorBon"
            defaultValue={initial?.nomorBon}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customerId">Customer</Label>
        <select
          id="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
          required
        >
          <option value="">Pilih customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <Label>Produk</Label>
        {lines.map((line, index) => {
          const product = products.find((p) => p.id === line.productId);
          const discounted =
            product && customer
              ? applyCascadingDiscount(
                  product.hargaBase,
                  parseDiscountSteps(
                    product.tipe === "LM" ? customer.discountLm : customer.discountBr
                  )
                ).toDecimalPlaces(0)
              : null;

          return (
            <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 md:grid-cols-4">
              <select
                value={line.productId}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], productId: e.target.value };
                  setLines(next);
                }}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm md:col-span-2"
              >
                <option value="">Pilih produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.tipe})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], quantity: Number(e.target.value) };
                  setLines(next);
                }}
              />
              <div className="flex items-center text-sm text-gray-600">
                {product && discounted !== null && (
                  <span>
                    {product.tipe} — {formatIdr(discounted.toNumber())}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setLines([...lines, { productId: "", quantity: 1 }])}
        >
          + Tambah Produk
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="ongkir">Ongkir (Rp)</Label>
          <Input
            id="ongkir"
            name="ongkir"
            type="number"
            min={0}
            value={ongkir}
            onChange={(e) => setOngkir(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "PIUTANG"}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            <option value="PIUTANG">Piutang</option>
            <option value="LUNAS">Lunas</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isBonus}
              onChange={(e) => setIsBonus(e.target.checked)}
            />
            Transaksi Bonus
          </label>
        </div>
      </div>

      {isBonus && (
        <div>
          <Label htmlFor="bonusCount">Jumlah Bonus Diberikan</Label>
          <Input
            id="bonusCount"
            name="bonusCount"
            type="number"
            min={1}
            defaultValue={initial?.bonusCount ?? 1}
          />
        </div>
      )}

      <div>
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Input id="deskripsi" name="deskripsi" defaultValue={initial?.deskripsi ?? ""} />
      </div>

      {preview && (
        <div className="rounded-lg bg-[var(--muted)] p-4 text-sm">
          <p>Omzet: {formatIdr(preview.transactionOmzet.toNumber())}</p>
          <p>Laba HL: {formatIdr(preview.transactionLaba.toNumber())}</p>
          <p>Total Piutang: {formatIdr(preview.amountOwed.toNumber())}</p>
        </div>
      )}

      <Button type="submit">Simpan Transaksi</Button>
    </form>
  );
}
