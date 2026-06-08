import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatIdr } from "@/lib/format-idr";
import * as transactionService from "@/lib/services/transactions";
import { prisma } from "@hl/database";

export default async function DashboardPage() {
  const transactions = await transactionService.listTransactions();
  const customers = await prisma.customer.count({ where: { deletedAt: null } });

  let totalPiutang = 0;
  let omzetBulanIni = 0;
  let bonusPending = 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const tx of transactions) {
    const lineOmzet = tx.lines.reduce(
      (sum, line) =>
        line.isBonusLine
          ? sum
          : sum + Number(line.discountedUnitPrice) * line.quantity,
      0
    );
    const owed = lineOmzet + Number(tx.ongkir);

    if (tx.status === "PIUTANG") {
      totalPiutang += owed;
    }

    if (
      tx.status === "LUNAS" &&
      !tx.isBonus &&
      new Date(tx.tanggal) >= monthStart
    ) {
      omzetBulanIni += lineOmzet;
    }
  }

  const activeCustomers = await prisma.customer.findMany({
    where: { deletedAt: null },
  });

  for (const customer of activeCustomers) {
    const info = await transactionService.getCustomerBonusInfo(customer.id);
    bonusPending += info.available;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">Ringkasan penjualan dan piutang HL</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-600">Total Piutang</p>
          <p className="mt-2 text-2xl font-bold">{formatIdr(totalPiutang)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Omzet Bulan Ini (Lunas)</p>
          <p className="mt-2 text-2xl font-bold">{formatIdr(omzetBulanIni)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Bonus Pending</p>
          <p className="mt-2 text-2xl font-bold">{bonusPending}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Customer Aktif</p>
          <p className="mt-2 text-2xl font-bold">{customers}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
          <Link href="/transactions/new" className="text-sm text-[var(--primary)]">
            + Buat Bon
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Nomor Bon</th>
                <th>Customer</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-2">
                    <Link href={`/transactions/${tx.id}`} className="text-[var(--primary)]">
                      {tx.nomorBon}
                    </Link>
                  </td>
                  <td>{tx.customer.nama}</td>
                  <td>{new Date(tx.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>{tx.status === "LUNAS" ? "Lunas" : "Piutang"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
