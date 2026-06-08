import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettleMonthForm } from "@/components/customers/settle-month-form";
import { formatIdr } from "@/lib/format-idr";
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

  const customer = await customerService.getCustomerById(id);
  if (!customer) notFound();

  const now = new Date();
  const year = Number(query.year ?? now.getFullYear());
  const month = Number(query.month ?? now.getMonth() + 1);

  const { transactions, totals } = await customerService.getCustomerMonthlySummary(
    id,
    year,
    month
  );
  const bonusInfo = await transactionService.getCustomerBonusInfo(id);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.nama}</h1>
          <p className="text-sm text-gray-600">Detail customer per bulan</p>
        </div>
        <Link href={`/customers/${id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
      </div>

      {bonusInfo.available > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <p className="font-medium text-purple-900">
            Bonus tersedia: {bonusInfo.available} (omzet lunas:{" "}
            {formatIdr(bonusInfo.paidOmzet)})
          </p>
        </Card>
      )}

      <Card>
        <form method="get" className="flex flex-wrap gap-3">
          <select
            name="month"
            defaultValue={month}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Bulan {m}
              </option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={year}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card><p className="text-xs text-gray-600">Piutang</p><p className="font-bold">{formatIdr(totals.totalPiutang)}</p></Card>
        <Card><p className="text-xs text-gray-600">Sudah Dibayar</p><p className="font-bold">{formatIdr(totals.totalDibayar)}</p></Card>
        <Card><p className="text-xs text-gray-600">Omzet (Lunas)</p><p className="font-bold">{formatIdr(totals.totalOmzet)}</p></Card>
        <Card><p className="text-xs text-gray-600">Laba HL</p><p className="font-bold">{formatIdr(totals.totalLaba)}</p></Card>
        <Card><p className="text-xs text-gray-600">Omzet LM</p><p className="font-bold">{formatIdr(totals.omzetLm)}</p></Card>
        <Card><p className="text-xs text-gray-600">Omzet BR</p><p className="font-bold">{formatIdr(totals.omzetBr)}</p></Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Pelunasan Bulanan</h2>
        <SettleMonthForm customerId={id} year={year} month={month} />
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Transaksi {month}/{year}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Nomor Bon</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Omzet</th>
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
                return (
                  <tr key={tx.id} className="border-b">
                    <td className="py-2">
                      <Link href={`/transactions/${tx.id}`} className="text-[var(--primary)]">
                        {tx.nomorBon}
                      </Link>
                      {tx.isBonus && <Badge variant="bonus">Bonus</Badge>}
                    </td>
                    <td>{new Date(tx.tanggal).toLocaleDateString("id-ID")}</td>
                    <td>
                      <Badge variant={tx.status === "LUNAS" ? "success" : "warning"}>
                        {tx.status === "LUNAS" ? "Lunas" : "Piutang"}
                      </Badge>
                    </td>
                    <td>{formatIdr(omzet)}</td>
                    <td>
                      <Link href={`/transactions/${tx.id}`}>
                        <Button variant="ghost">Detail</Button>
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
