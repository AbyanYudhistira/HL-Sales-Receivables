import * as customerService from "@/lib/services/customers";
import * as transactionService from "@/lib/services/transactions";

import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
    customerId?: string;
  }>;
}) {
  const query = await searchParams;
  const now = new Date();
  const month = Number(query.month ?? now.getMonth() + 1);
  const year = Number(query.year ?? now.getFullYear());
  const status = query.status ?? "all";
  const customerId = query.customerId ?? "";

  const transactions = await transactionService.listTransactions({
    year,
    month,
    ...(status === "LUNAS" || status === "PIUTANG"
      ? { status: status as "LUNAS" | "PIUTANG" }
      : {}),
    ...(customerId ? { customerId } : {}),
  });

  const customers = await customerService.listCustomers();

  return (
    <TransactionsPageClient
      initialMonth={month}
      initialYear={year}
      initialStatus={status}
      initialCustomerId={customerId}
      customers={customers.map((customer) => ({ id: customer.id, nama: customer.nama }))}
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
          customerId: tx.customerId,
          customerName: tx.customer.nama,
          tanggal: tx.tanggal.toISOString(),
          total,
          status: tx.status,
          isBonus: tx.isBonus,
        };
      })}
    />
  );
}
