import { computeBonusProgress } from "@hl/calculations";
import { notFound } from "next/navigation";

import { CustomerDetailClient } from "@/components/customers/customer-detail-client";
import { parseMonthYear } from "@/lib/parse-search-params";
import * as customerService from "@/lib/services/customers";
import * as transactionService from "@/lib/services/transactions";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string; tipe?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { month, year } = parseMonthYear(query);
  const tipe = query.tipe === "LM" || query.tipe === "BR" ? query.tipe : "all";

  const customer = await customerService.getCustomerById(id);
  if (!customer) notFound();

  const [monthlySummary, bonusInfo] = await Promise.all([
    customerService.getCustomerMonthlySummary(
      id,
      year,
      month,
      tipe === "LM" || tipe === "BR" ? tipe : undefined
    ),
    transactionService.getCustomerBonusInfo(id),
  ]);

  const { transactions, totals } = monthlySummary;
  const bonusProgress = computeBonusProgress(bonusInfo.paidOmzet, bonusInfo.threshold);

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
      tipe={tipe}
      totals={totals}
      bonusAvailable={bonusInfo.available}
      paidOmzet={bonusInfo.paidOmzet}
      bonusProgress={bonusProgress}
      transactions={transactions.map((tx) => ({
        id: tx.id,
        nomorBon: tx.nomorBon,
        tanggal: tx.tanggal,
        status: tx.status,
        total: tx.total,
        isBonus: tx.isBonus,
        productTypes: tx.productTypes,
      }))}
    />
  );
}
