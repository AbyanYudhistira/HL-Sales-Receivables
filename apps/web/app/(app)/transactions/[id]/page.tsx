import { notFound } from "next/navigation";

import { TransactionDetailClient } from "@/components/transactions/transaction-detail-client";
import { parseDiscountSteps } from "@/lib/format-idr";
import * as transactionService from "@/lib/services/transactions";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tx = await transactionService.getTransactionById(id);
  if (!tx) notFound();

  const omzet = tx.lines.reduce(
    (sum, line) =>
      line.isBonusLine ? sum : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );
  const total = omzet + Number(tx.ongkir);

  return (
    <TransactionDetailClient
      transactionId={id}
      nomorBon={tx.nomorBon}
      tanggal={tx.tanggal.toISOString()}
      status={tx.status}
      isBonus={tx.isBonus}
      customerName={tx.customer.nama}
      discountLm={parseDiscountSteps(tx.customer.discountLm)}
      discountBr={parseDiscountSteps(tx.customer.discountBr)}
      omzet={omzet}
      ongkir={Number(tx.ongkir)}
      total={total}
      deskripsi={tx.deskripsi}
      lines={tx.lines.map((line) => ({
        id: line.id,
        nama: line.product.nama,
        quantity: line.quantity,
        discountedUnitPrice: Number(line.discountedUnitPrice),
        subtotal: Number(line.discountedUnitPrice) * line.quantity,
      }))}
    />
  );
}
