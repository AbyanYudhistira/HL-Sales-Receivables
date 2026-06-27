import * as customerService from "@/lib/services/customers";
import * as transactionService from "@/lib/services/transactions";
import { parseMonthYear, parsePage } from "@/lib/parse-search-params";

import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
    customerId?: string;
    tipe?: string;
    page?: string;
  }>;
}) {
  const query = await searchParams;
  const { month, year } = parseMonthYear(query);
  const status = query.status ?? "all";
  const customerId = query.customerId ?? "";
  const tipe = query.tipe === "LM" || query.tipe === "BR" ? query.tipe : "all";
  const page = parsePage(query.page);

  const [transactionResult, customers] = await Promise.all([
    transactionService.listTransactionsForTable({
      year,
      month,
      page,
      pageSize: transactionService.TRANSACTIONS_PAGE_SIZE,
      ...(status === "LUNAS" || status === "PIUTANG"
        ? { status: status as "LUNAS" | "PIUTANG" }
        : {}),
      ...(customerId ? { customerId } : {}),
      ...(tipe === "LM" || tipe === "BR" ? { productType: tipe } : {}),
    }),
    customerService.listCustomerOptions(),
  ]);

  return (
    <TransactionsPageClient
      initialMonth={month}
      initialYear={year}
      initialStatus={status}
      initialCustomerId={customerId}
      initialType={tipe}
      initialPage={page}
      totalCount={transactionResult.totalCount}
      customers={customers}
      transactions={transactionResult.rows.map((tx) => ({
        id: tx.id,
        nomorBon: tx.nomorBon,
        customerId: tx.customerId,
        customerName: tx.customerName,
        tanggal: tx.tanggal,
        total: tx.total,
        status: tx.status,
        isBonus: tx.isBonus,
      }))}
    />
  );
}
