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
import { showSuccessToast } from "@/lib/toast";
import {
  formatDateShort,
  formatDiscountSteps,
  formatIdr,
  formatMonthYear,
  INDONESIAN_MONTHS,
  parseDiscountSteps,
} from "@/lib/format-idr";

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
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

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
                <GiftBadge>{bonusAvailable} hadiah tersedia</GiftBadge>
              )}
            </div>
            <p className="text-base text-muted-foreground">
              Batas hadiah {formatIdr(customer.bonusThreshold)} · Diskon LM{" "}
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
        <StatCard label="Laba" value={formatIdr(totals.totalLaba)} icon={BarChart3} tone="default" />
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
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDateShort(new Date(tx.tanggal))}</TableCell>
                <TableCell className="font-medium">{tx.nomorBon}</TableCell>
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
          await deleteCustomerAction(customerId);
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
          const count = await settleMonthAction(customerId, year, month, date);
          setPaymentOpen(false);
          showSuccessToast(`${count} bon ditandai Sudah Bayar.`);
          router.refresh();
        }}
      />

    </div>
  );
}
