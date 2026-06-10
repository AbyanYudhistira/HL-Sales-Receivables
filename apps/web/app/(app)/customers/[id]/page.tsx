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

  const customer = await customerService.getCustomerById(id);
  if (!customer) notFound();

  const [monthlySummary, bonusMap] = await Promise.all([
    customerService.getCustomerMonthlySummary(id, year, month),
    transactionService.getBonusAvailableMap([
      { id: customer.id, bonusThreshold: customer.bonusThreshold },
    ]),
  ]);

  const { transactions, totals } = monthlySummary;
  const bonusAvailable = bonusMap.get(customer.id) ?? 0;

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
      bonusAvailable={bonusAvailable}
      transactions={transactions.map((tx) => ({
        id: tx.id,
        nomorBon: tx.nomorBon,
        tanggal: tx.tanggal.toISOString(),
        status: tx.status,
        total: tx.total,
        isBonus: tx.isBonus,
      }))}
    />
  );
}
