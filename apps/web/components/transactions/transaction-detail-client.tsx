"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { settleTransactionAction } from "@/actions/settlement";
import { deleteTransactionAction } from "@/actions/transactions";
import { GiftBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoneyTotal, SummaryLine } from "@/components/ui/money-summary";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaymentDateDialog } from "@/components/ui/payment-date-dialog";
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
  formatDateLong,
  formatDiscountSteps,
  formatIdr,
  parseDiscountSteps,
} from "@/lib/format-idr";

type LineRow = {
  id: string;
  nama: string;
  quantity: number;
  discountedUnitPrice: number;
  subtotal: number;
};

export function TransactionDetailClient({
  transactionId,
  nomorBon,
  tanggal,
  status,
  isBonus,
  customerName,
  discountLm,
  discountBr,
  omzet,
  ongkir,
  total,
  deskripsi,
  lines,
}: {
  transactionId: string;
  nomorBon: string;
  tanggal: string;
  status: "PIUTANG" | "LUNAS";
  isBonus: boolean;
  customerName: string;
  discountLm: number[];
  discountBr: number[];
  omzet: number;
  ongkir: number;
  total: number;
  deskripsi?: string | null;
  lines: LineRow[];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div className="space-y-8 pb-28 lg:pb-8">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{formatDateLong(new Date(tanggal))}</p>
            <h1 className="mt-1 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-foreground">
              {nomorBon}
            </h1>
            <p className="mt-2 text-base text-foreground">{customerName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Diskon LM {formatDiscountSteps(discountLm)} · Diskon BR{" "}
              {formatDiscountSteps(discountBr)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={status === "LUNAS" ? "paid" : "unpaid"} />
            {isBonus && <GiftBadge>Bonus</GiftBadge>}
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nama</TableHeader>
              <TableHeader>Qty</TableHeader>
              <TableHeader>Harga setelah diskon</TableHeader>
              <TableHeader>Subtotal</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.nama}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell>{formatIdr(line.discountedUnitPrice)}</TableCell>
                <TableCell>{formatIdr(line.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <div className="space-y-3 text-base">
          <SummaryLine label="Total Omzet" value={formatIdr(omzet)} />
          <SummaryLine label="Ongkir" value={formatIdr(ongkir)} />
          <MoneyTotal label="Total Tagihan" value={formatIdr(total)} />
        </div>
      </Card>

      {deskripsi && (
        <Card>
          <p className="text-sm text-muted-foreground">Catatan</p>
          <p className="mt-2 text-base text-foreground">{deskripsi}</p>
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-6 py-4 md:px-8 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
          {status === "PIUTANG" && (
            <Button size="lg" onClick={() => setPaymentOpen(true)}>
              Tandai Sudah Bayar
            </Button>
          )}
          <Link href={`/transactions/new?edit=${transactionId}`}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Edit
            </Button>
          </Link>
          <Button
            size="lg"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Hapus
          </Button>
          <DownloadPdfButton
            href={`/api/pdf/bon/${transactionId}`}
            filename={`bon-${sanitizeFilename(nomorBon)}.pdf`}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus bon ini?"
        description="Bon yang dihapus tidak bisa dipulihkan."
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteTransactionAction(transactionId);
          if (result && "success" in result && !result.success) {
            showErrorToast(result.error ?? "Gagal menghapus bon");
            setDeleteOpen(false);
            return;
          }
          router.push("/transactions");
        }}
      />

      <PaymentDateDialog
        open={paymentOpen}
        title="Tandai sudah bayar"
        description="Pilih tanggal pembayaran untuk bon ini."
        confirmLabel="Ya, lanjutkan"
        onCancel={() => setPaymentOpen(false)}
        onConfirm={async (date) => {
          const result = await settleTransactionAction(transactionId, date);
          if (result && "success" in result && !result.success) {
            showErrorToast(result.error ?? "Gagal menandai sudah bayar");
            return;
          }
          setPaymentOpen(false);
          showSuccessToast("Bon ditandai Sudah Bayar.");
          router.refresh();
        }}
      />
    </div>
  );
}
