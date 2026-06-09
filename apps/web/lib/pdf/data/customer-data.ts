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

  const [{ transactions, totals }, bonusInfo] = await Promise.all([
    customerService.getCustomerMonthlySummary(id, year, month),
    transactionService.getCustomerBonusInfo(id),
  ]);

  return {
    customerName: customer.nama,
    month,
    year,
    bonusThreshold: Number(customer.bonusThreshold),
    bonusAvailable: bonusInfo.available,
    discountLm: parseDiscountSteps(customer.discountLm),
    discountBr: parseDiscountSteps(customer.discountBr),
    totals,
    transactions: transactions.map((tx) => {
      const total =
        tx.lines.reduce(
          (sum, line) =>
            line.isBonusLine
              ? sum
              : sum + Number(line.discountedUnitPrice) * line.quantity,
          0
        ) + Number(tx.ongkir);

      return {
        nomorBon: tx.nomorBon,
        tanggal: tx.tanggal.toISOString(),
        total,
        status: tx.status,
        isBonus: tx.isBonus,
      };
    }),
  };
}
