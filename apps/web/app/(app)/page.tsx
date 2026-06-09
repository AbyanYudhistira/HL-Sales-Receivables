import Link from "next/link";
import { BarChart3, Gift, Plus, TrendingUp, UserPlus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateLong, formatIdr } from "@/lib/format-idr";
import * as transactionService from "@/lib/services/transactions";
import { prisma } from "@hl/database";

export default async function BerandaPage() {
  const transactions = await transactionService.listTransactions();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  let belumBayarHariIni = 0;
  let sudahBayarBulanIni = 0;
  let omzetBulanIni = 0;
  let pelangganHadiah = 0;

  for (const tx of transactions) {
    const lineOmzet = tx.lines.reduce(
      (sum, line) =>
        line.isBonusLine
          ? sum
          : sum + Number(line.discountedUnitPrice) * line.quantity,
      0
    );
    const owed = lineOmzet + Number(tx.ongkir);
    const txDate = new Date(tx.tanggal);

    if (tx.status === "PIUTANG" && txDate >= todayStart && txDate < todayEnd) {
      belumBayarHariIni += owed;
    }

    if (tx.status === "LUNAS" && !tx.isBonus && txDate >= monthStart) {
      sudahBayarBulanIni += owed;
      omzetBulanIni += lineOmzet;
    }
  }

  const activeCustomers = await prisma.customer.findMany({
    where: { deletedAt: null },
  });

  for (const customer of activeCustomers) {
    const info = await transactionService.getCustomerBonusInfo(customer.id);
    if (info.available > 0) {
      pelangganHadiah += 1;
    }
  }

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] font-semibold text-foreground">
          Selamat datang
        </h1>
        <p className="mt-2 text-base text-muted-foreground">{formatDateLong(now)}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Belum Bayar hari ini"
          value={formatIdr(belumBayarHariIni)}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="Sudah Bayar bulan ini"
          value={formatIdr(sudahBayarBulanIni)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Total omzet bulan ini"
          value={formatIdr(omzetBulanIni)}
          icon={BarChart3}
          tone="default"
        />
        <StatCard
          label="Pelanggan dapat hadiah"
          value={String(pelangganHadiah)}
          icon={Gift}
          tone="info"
        />
      </section>

      <section className="flex flex-col gap-4 sm:flex-row">
        <Link href="/penjualan/baru" className="flex-1">
          <Button size="lg" className="w-full">
            <Plus className="size-5" aria-hidden />
            Catat Penjualan Baru
          </Button>
        </Link>
        <Link href="/pelanggan" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">
            <UserPlus className="size-5" aria-hidden />
            Tambah Pelanggan
          </Button>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Transaksi terbaru
          </h2>
          <Link
            href="/penjualan"
            className="text-base font-medium text-primary hover:text-primary/80"
          >
            Lihat semua
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <Card className="flex flex-col items-center py-12 text-center">
            <Gift className="size-10 text-muted-foreground" aria-hidden />
            <p className="mt-4 max-w-sm text-base text-muted-foreground">
              Belum ada penjualan. Yuk catat penjualan pertama!
            </p>
            <Link href="/penjualan/baru" className="mt-6">
              <Button size="lg">
                <Plus className="size-5" aria-hidden />
                Catat Penjualan Baru
              </Button>
            </Link>
          </Card>
        ) : (
          <ul className="space-y-3">
            {recentTransactions.map((tx) => {
              const total =
                tx.lines.reduce(
                  (sum, line) =>
                    line.isBonusLine
                      ? sum
                      : sum + Number(line.discountedUnitPrice) * line.quantity,
                  0
                ) + Number(tx.ongkir);

              return (
                <li key={tx.id}>
                  <Link href={`/penjualan/${tx.id}`}>
                    <Card className="flex flex-wrap items-center justify-between gap-3 transition-colors hover:bg-accent/20">
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(tx.tanggal))}
                        </p>
                        <p className="mt-1 text-base font-medium text-foreground">
                          {tx.customer.nama}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-display text-lg font-semibold text-foreground">
                          {formatIdr(total)}
                        </p>
                        <StatusBadge status={tx.status === "LUNAS" ? "paid" : "unpaid"} />
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
