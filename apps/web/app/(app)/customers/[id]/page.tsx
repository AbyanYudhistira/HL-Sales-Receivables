import { notFound } from "next/navigation";

import { CustomerDetailClient } from "@/components/customers/customer-detail-client";
import * as customerService from "@/lib/services/customers";
import * as transactionService from "@/lib/services/transactions";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const now = new Date();
  const year = Number(query.year ?? now.getFullYear());
  const month = Number(query.month ?? now.getMonth() + 1);

  const [customer, monthlySummary, bonusInfo] = await Promise.all([
    customerService.getCustomerById(id),
    customerService.getCustomerMonthlySummary(id, year, month),
    transactionService.getCustomerBonusInfo(id),
  ]);

  if (!customer) notFound();

  const { transactions, totals } = monthlySummary;

  return (
    <CustomerDetailClient
      customerId={id}
      customer={{
        nama: customer.nama,
        discountLm: customer.discountLm,
        discountBr: customer.discountBr,
        bonusThreshold: Number(customer.bonusThreshold),
      }}
      year={year}
      month={month}
      totals={totals}
      bonusAvailable={bonusInfo.available}
      transactions={transactions.map((tx) => {
        const total =
          tx.lines.reduce(
            (sum, line) =>
              line.isBonusLine
                ? sum
                : sum + Number(line.discountedUnitPrice) * line.quantity,
            0
          ) + Number(tx.ongkir);

        return {
          id: tx.id,
          nomorBon: tx.nomorBon,
          tanggal: tx.tanggal.toISOString(),
          status: tx.status,
          total,
          isBonus: tx.isBonus,
        };
      })}
    />
  );
}
