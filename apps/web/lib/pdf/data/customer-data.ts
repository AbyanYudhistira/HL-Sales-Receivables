import { parseDiscountSteps } from "@/lib/format-idr";
import type { CustomerPdfData } from "@/lib/pdf/templates/customer-document";
import * as customerService from "@/lib/services/customers";
import * as transactionService from "@/lib/services/transactions";

export async function buildCustomerPdfData(
  id: string,
  year: number,
  month: number
): Promise<CustomerPdfData | null> {
  const customer = await customerService.getCustomerById(id);
  if (!customer) return null;

  const [{ transactions, totals }, bonusMap] = await Promise.all([
    customerService.getCustomerMonthlySummary(id, year, month),
    transactionService.getBonusAvailableMap([
      { id: customer.id, bonusThreshold: customer.bonusThreshold },
    ]),
  ]);

  return {
    customerName: customer.nama,
    month,
    year,
    bonusThreshold: Number(customer.bonusThreshold),
    bonusAvailable: bonusMap.get(customer.id) ?? 0,
    discountLm: parseDiscountSteps(customer.discountLm),
    discountBr: parseDiscountSteps(customer.discountBr),
    totals,
    transactions: transactions.map((tx) => ({
      nomorBon: tx.nomorBon,
      tanggal: tx.tanggal.toISOString(),
      total: tx.total,
      status: tx.status,
      isBonus: tx.isBonus,
    })),
  };
}
