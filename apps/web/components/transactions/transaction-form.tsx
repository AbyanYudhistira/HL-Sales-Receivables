"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyCascadingDiscount, computeTransactionTotals } from "@hl/calculations";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IntegerInput, toIntegerString } from "@/components/ui/integer-input";
import { Label } from "@/components/ui/label";
import { MoneyTotal, SummaryLine } from "@/components/ui/money-summary";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatIdr, parseDiscountSteps } from "@/lib/format-idr";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

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
  bonusAvailable: number;
}

interface LineState {
  productId: string;
  quantity: number;
}

interface TransactionFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string } | void>;
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
  cancelHref?: string;
  successHref?: string;
}

export function TransactionForm({
  action,
  customers,
  products,
  initial,
  cancelHref = "/transactions",
  successHref = "/transactions",
}: TransactionFormProps) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [lines, setLines] = useState<LineState[]>(
    initial?.lines ?? [{ productId: "", quantity: 1 }]
  );
  const [ongkir, setOngkir] = useState(toIntegerString(initial?.ongkir));
  const [isBonus, setIsBonus] = useState(initial?.isBonus ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const customer = customers.find((c) => c.id === customerId);
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((item) => item.nama.toLowerCase().includes(query));
  }, [customers, customerSearch]);

  const preview = useMemo(() => {
    if (!customer) return null;

    const lineInputs = lines
      .filter((line) => line.productId)
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
    return computeTransactionTotals(lineInputs, Number(ongkir || 0));
  }, [customer, lines, ongkir, isBonus, products]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!customerId) {
      const message = "Pelanggan wajib dipilih";
      setError(message);
      showErrorToast(message);
      return;
    }

    const validLines = lines.filter((line) => line.productId && line.quantity > 0);
    if (validLines.length === 0) {
      const message = "Minimal 1 produk";
      setError(message);
      showErrorToast(message);
      return;
    }

    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("customerId", customerId);
    formData.set("isBonus", String(isBonus));
    if (isBonus) {
      formData.set("bonusCount", "1");
    }
    if (initial?.status) {
      formData.set("status", initial.status);
    } else {
      formData.set("status", "PIUTANG");
    }
    formData.set(
      "lines",
      JSON.stringify(
        lines
          .filter((line) => line.productId && line.quantity > 0)
          .map((line) => ({ ...line, isBonusLine: isBonus }))
      )
    );

    const result = await action(formData);
    setPending(false);

    if (result && "success" in result && !result.success) {
      const message = result.error ?? "Gagal menyimpan";
      setError(message);
      showErrorToast(message);
      return;
    }

    if (result && "success" in result && result.success) {
      showSuccessToast(initial ? "Perubahan disimpan." : "Penjualan dicatat.");
      router.push(successHref);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[1fr_minmax(280px,400px)] lg:items-start lg:gap-8">
      <div className="space-y-6 pb-32 lg:pb-0">
        {error && (
          <div
            id="transaction-error"
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
          >
            {error}
          </div>
        )}

        <Card className="space-y-5">
          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              defaultValue={initial?.tanggal ?? new Date().toISOString().slice(0, 10)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="nomorBon">No. Bon</Label>
            <Input
              id="nomorBon"
              name="nomorBon"
              defaultValue={initial?.nomorBon}
              required
              aria-invalid={error?.includes("bon") ? true : undefined}
              aria-describedby={error ? "transaction-error" : undefined}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="customer-select">Pilih Pelanggan</Label>
            <SearchInput
              value={customerSearch}
              onChange={setCustomerSearch}
              placeholder="Cari pelanggan..."
              aria-label="Cari pelanggan"
              className="mt-2"
            />
            <Select
              id="customer-select"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              required
              className="mt-2"
            >
              <option value="">Pilih pelanggan</option>
              {filteredCustomers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </Select>
            {customer && customer.bonusAvailable > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Pelanggan ini punya {customer.bonusAvailable} hadiah tersedia.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">Daftar Barang</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLines([...lines, { productId: "", quantity: 1 }])}
            >
              <Plus className="size-5" aria-hidden />
              Tambah Barang
            </Button>
          </div>

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
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1.4fr_0.6fr_0.8fr_auto]"
              >
                <Select
                  value={line.productId}
                  onChange={(event) => {
                    const next = [...lines];
                    next[index] = { ...next[index], productId: event.target.value };
                    setLines(next);
                  }}
                  aria-label={`Barang baris ${index + 1}`}
                >
                  <option value="">Pilih barang</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.tipe})
                    </option>
                  ))}
                </Select>
                <IntegerInput
                  value={toIntegerString(line.quantity)}
                  aria-label={`Jumlah baris ${index + 1}`}
                  onValueChange={(value) => {
                    const next = [...lines];
                    next[index] = {
                      ...next[index],
                      quantity: Math.max(1, Number(value || 0)),
                    };
                    setLines(next);
                  }}
                />
                <Input
                  readOnly
                  value={discounted ? formatIdr(discounted.toNumber()) : ""}
                  aria-label={`Harga setelah diskon baris ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus baris ${index + 1}`}
                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                >
                  <Minus className="size-5" />
                </Button>
              </div>
            );
          })}
        </Card>

        <Card className="space-y-5">
          <div>
            <Label htmlFor="ongkir">Ongkir (Rp)</Label>
            <IntegerInput
              id="ongkir"
              name="ongkir"
              value={ongkir}
              onValueChange={setOngkir}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="deskripsi">Catatan</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              defaultValue={initial?.deskripsi ?? ""}
              className="mt-2"
            />
          </div>

          <Switch
            id="bonus-switch"
            checked={isBonus}
            onCheckedChange={setIsBonus}
            disabled={!customer || customer.bonusAvailable <= 0}
            label="Pakai hadiah untuk bon ini"
          />
          {isBonus && (
            <>
              <input type="hidden" name="bonusCount" value="1" />
              <p className="text-sm text-muted-foreground">1 hadiah dipakai untuk bon ini.</p>
            </>
          )}
          {!initial && (
            <input type="hidden" name="status" value="PIUTANG" />
          )}
          {initial && <input type="hidden" name="status" value={initial.status} />}
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-6 py-4 md:px-8 lg:sticky lg:top-8 lg:rounded-2xl lg:border lg:p-6">
        <Card className="border-0 bg-transparent p-0 shadow-none lg:border lg:bg-card lg:p-6">
          <div className="space-y-3 text-base">
            <SummaryLine
              label="Total Omzet"
              value={formatIdr(preview?.transactionOmzet.toNumber() ?? 0)}
            />
            <SummaryLine label="Ongkir" value={formatIdr(ongkir)} />
            <MoneyTotal
              label="Total Tagihan"
              value={formatIdr(preview?.amountOwed.toNumber() ?? Number(ongkir || 0))}
            />
          </div>

          <div className="mt-6 space-y-3">
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              Simpan
            </Button>
            <Link href={cancelHref} className="block">
              <Button type="button" variant="ghost" className="w-full">
                Batal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </form>
  );
}
