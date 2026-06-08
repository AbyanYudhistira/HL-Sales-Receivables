import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIdr } from "@/lib/format-idr";
import * as transactionService from "@/lib/services/transactions";

export default async function TransactionsPage() {
  const transactions = await transactionService.listTransactions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaksi (Bon)</h1>
          <p className="text-sm text-gray-600">Daftar semua transaksi penjualan</p>
        </div>
        <Link href="/transactions/new">
          <Button>+ Bon Baru</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Nomor Bon</th>
                <th>Customer</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const omzet = tx.lines.reduce(
                  (sum, line) =>
                    line.isBonusLine
                      ? sum
                      : sum + Number(line.discountedUnitPrice) * line.quantity,
                  0
                );
                const total = omzet + Number(tx.ongkir);

                return (
                  <tr key={tx.id} className="border-b">
                    <td className="py-2">
                      <Link href={`/transactions/${tx.id}`} className="text-[var(--primary)]">
                        {tx.nomorBon}
                      </Link>
                      {tx.isBonus && (
                        <span className="ml-2">
                          <Badge variant="bonus">Bonus</Badge>
                        </span>
                      )}
                    </td>
                    <td>{tx.customer.nama}</td>
                    <td>{new Date(tx.tanggal).toLocaleDateString("id-ID")}</td>
                    <td>{formatIdr(total)}</td>
                    <td>
                      <Badge variant={tx.status === "LUNAS" ? "success" : "warning"}>
                        {tx.status === "LUNAS" ? "Lunas" : "Piutang"}
                      </Badge>
                    </td>
                    <td>
                      <Link href={`/transactions/${tx.id}/edit`}>
                        <Button variant="ghost">Edit</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
