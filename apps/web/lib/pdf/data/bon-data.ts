import { parseDiscountSteps } from "@/lib/format-idr";
import type { BonPdfData } from "@/lib/pdf/templates/bon-document";
import * as transactionService from "@/lib/services/transactions";

export async function buildBonPdfData(id: string): Promise<BonPdfData | null> {
  const tx = await transactionService.getTransactionById(id);
  if (!tx) return null;

  const omzet = tx.lines.reduce(
    (sum, line) =>
      line.isBonusLine ? sum : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );

  return {
    nomorBon: tx.nomorBon,
    tanggal: tx.tanggal.toISOString(),
    status: tx.status,
    isBonus: tx.isBonus,
    customerName: tx.customer.nama,
    discountLm: parseDiscountSteps(tx.customer.discountLm),
    discountBr: parseDiscountSteps(tx.customer.discountBr),
    omzet,
    ongkir: Number(tx.ongkir),
    total: omzet + Number(tx.ongkir),
    deskripsi: tx.deskripsi,
    lines: tx.lines.map((line) => ({
      nama: line.product.nama,
      quantity: line.quantity,
      discountedUnitPrice: Number(line.discountedUnitPrice),
      subtotal: Number(line.discountedUnitPrice) * line.quantity,
    })),
  };
}
