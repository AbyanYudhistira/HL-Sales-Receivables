"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

import { deleteCustomerAction } from "@/actions/customers";
import { settleMonthAction } from "@/actions/settlement";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { GiftBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaymentDateDialog } from "@/components/ui/payment-date-dialog";
import { LabaVisibilityToggle } from "@/components/ui/laba-visibility-toggle";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button";
import { sanitizeFilename } from "@/lib/pdf/filename";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import {
  formatDateShort,
  formatDiscountSteps,
  formatIdr,
  formatMonthYear,
  INDONESIAN_MONTHS,
  parseDiscountSteps,
} from "@/lib/format-idr";
import { formatLabaDisplay } from "@/lib/format-laba";

type TransactionRow = {
  id: string;
  nomorBon: string;
  tanggal: string;
  status: "PIUTANG" | "LUNAS";
  total: number;
  isBonus: boolean;
};

export function CustomerDetailClient({
  customerId,
  customer,
  year,
  month,
  totals,
  transactions,
  bonusAvailable,
  paidOmzet,
  bonusProgress,
}: {
  customerId: string;
  customer: {
    nama: string;
    discountLm: unknown;
    discountBr: unknown;
    bonusThreshold: number;
  };
  year: number;
  month: number;
  totals: {
    totalPiutang: number;
    totalDibayar: number;
    totalOmzet: number;
    totalLaba: number;
    omzetLm: number;
    omzetBr: number;
  };
  transactions: TransactionRow[];
  bonusAvailable: number;
  paidOmzet: number;
  bonusProgress: {
    progressAmount: number;
    remainingAmount: number;
    percent: number;
  };
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [showLaba, setShowLaba] = useState(true);

  const discountLm = parseDiscountSteps(customer.discountLm);
  const discountBr = parseDiscountSteps(customer.discountBr);
  const years = [year - 1, year, year + 1];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Link
          href="/customers"
          className="inline-flex min-h-12 items-center gap-2 text-base font-medium text-primary hover:text-primary/80"
        >
          <ArrowLeft className="size-5" aria-hidden />
          Kembali
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-foreground">
                {customer.nama}
              </h1>
              {bonusAvailable > 0 && (
                <GiftBadge>{bonusAvailable} bonus tersedia</GiftBadge>
              )}
            </div>
            <p className="text-base text-muted-foreground">
              Batas bonus {formatIdr(customer.bonusThreshold)} · Diskon LM{" "}
              {formatDiscountSteps(discountLm)} · Diskon BR {formatDiscountSteps(discountBr)}
            </p>
            <p className="text-sm text-muted-foreground">Diskon dihitung bertahap.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {customer.bonusThreshold > 0 && (
        <Card className="p-6">
          <p className="text-lg font-semibold text-foreground">
            Total Bonus: {bonusAvailable}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Omzet lunas {formatIdr(paidOmzet)}
          </p>
          <div
            role="progressbar"
            aria-valuenow={Math.round(bonusProgress.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress menuju bonus berikutnya"
            className="mt-4 h-3 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${bonusProgress.percent}%` }}
            />
          </div>
          <p className="mt-3 text-base text-muted-foreground">
            {formatIdr(bonusProgress.remainingAmount)} lagi untuk bonus berikutnya
          </p>
        </Card>
      )}

      <Card>
        <form method="get" className="flex flex-wrap gap-3">
          <Select name="month" defaultValue={month} className="w-auto min-w-[180px]" aria-label="Bulan">
            {INDONESIAN_MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="year" defaultValue={year} className="w-auto min-w-[120px]" aria-label="Tahun">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Terapkan
          </Button>
        </form>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Belum Bayar"
          value={formatIdr(totals.totalPiutang)}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="Sudah Bayar"
          value={formatIdr(totals.totalDibayar)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Omzet"
          value={formatIdr(totals.totalOmzet)}
          hint={`LM ${formatIdr(totals.omzetLm)} · BR ${formatIdr(totals.omzetBr)}`}
          icon={BarChart3}
          tone="default"
        />
        <StatCard
          label="Laba"
          value={formatLabaDisplay(totals.totalLaba, showLaba)}
          icon={BarChart3}
          tone="default"
          valueAction={
            <LabaVisibilityToggle visible={showLaba} onToggle={setShowLaba} />
          }
        />
      </section>

      <Card className="p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold">
            Transaksi {formatMonthYear(month, year)}
          </h2>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Tanggal</TableHeader>
              <TableHeader>No. Bon</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-muted-foreground">
                  Tidak ada transaksi untuk bulan ini.
                </TableCell>
              </TableRow>
            ) : null}
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDateShort(new Date(tx.tanggal))}</TableCell>
                <TableCell className="font-medium">
                  {tx.nomorBon}
                  {tx.isBonus && <GiftBadge className="ml-2">Bonus</GiftBadge>}
                </TableCell>
                <TableCell>{formatIdr(tx.total)}</TableCell>
                <TableCell>
                  <StatusBadge status={tx.status === "LUNAS" ? "paid" : "unpaid"} />
                </TableCell>
                <TableCell>
                  <Link href={`/transactions/${tx.id}`}>
                    <Button variant="ghost">Lihat</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => setPaymentOpen(true)}>
          Tandai 1 Bulan Sudah Bayar
        </Button>
        <DownloadPdfButton
          href={`/api/pdf/customers/${customerId}?month=${month}&year=${year}`}
          filename={`pelanggan-${sanitizeFilename(customer.nama)}-${sanitizeFilename(formatMonthYear(month, year))}.pdf`}
          size="lg"
          variant="outline"
        />
      </div>

      <CustomerFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        customerId={customerId}
        initial={{
          nama: customer.nama,
          discountLm,
          discountBr,
          bonusThreshold: Number(customer.bonusThreshold),
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus pelanggan?"
        description="Data pelanggan akan dihapus dan tidak bisa dipulihkan."
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteCustomerAction(customerId);
          if (result && "success" in result && !result.success) {
            showErrorToast(result.error ?? "Gagal menghapus pelanggan");
            setDeleteOpen(false);
            return;
          }
          router.push("/customers");
        }}
      />

      <PaymentDateDialog
        open={paymentOpen}
        title="Tandai bulan sudah bayar"
        description={`Semua bon Belum Bayar ${formatMonthYear(month, year)} akan ditandai Sudah Bayar.`}
        confirmLabel="Ya, tandai sudah bayar"
        onCancel={() => setPaymentOpen(false)}
        onConfirm={async (date) => {
          const result = await settleMonthAction(customerId, year, month, date);
          if (result && "success" in result && !result.success) {
            showErrorToast(result.error ?? "Gagal menandai bulan sudah bayar");
            return;
          }
          setPaymentOpen(false);
          showSuccessToast(`${result.count} bon ditandai Sudah Bayar.`);
          router.refresh();
        }}
      />

    </div>
  );
}
