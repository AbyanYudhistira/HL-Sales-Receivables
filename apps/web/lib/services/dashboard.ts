import { computeBonusAvailable } from "@hl/calculations";
import { prisma } from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";

import {
  getPaidOmzetByCustomerMap,
  sumLunasFromDate,
  sumPiutangForDateRange,
} from "./aggregations";

export type DashboardSummary = {
  belumBayarHariIni: number;
  sudahBayarBulanIni: number;
  omzetBulanIni: number;
  pelangganHadiah: number;
  recentTransactions: Awaited<ReturnType<typeof fetchRecentTransactions>>;
};

async function fetchRecentTransactions() {
  return prisma.transaction.findMany({
    take: 5,
    orderBy: { tanggal: "desc" },
    include: {
      customer: { select: { nama: true } },
      lines: {
        select: {
          discountedUnitPrice: true,
          quantity: true,
          isBonusLine: true,
        },
      },
    },
  });
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    belumBayarHariIni,
    { totalPaid: sudahBayarBulanIni, omzet: omzetBulanIni },
    recentTransactions,
    customers,
    paidOmzetByCustomer,
    grantRows,
  ] = await Promise.all([
    sumPiutangForDateRange(todayStart, todayEnd),
    sumLunasFromDate(monthStart),
    fetchRecentTransactions(),
    prisma.customer.findMany({
      where: { deletedAt: null },
      select: { id: true, bonusThreshold: true },
    }),
    getPaidOmzetByCustomerMap(),
    prisma.bonusGrant.groupBy({
      by: ["customerId"],
      _sum: { bonusCount: true },
    }),
  ]);

  const grantedByCustomer = new Map(
    grantRows.map((row) => [row.customerId, row._sum.bonusCount ?? 0])
  );

  let pelangganHadiah = 0;
  for (const customer of customers) {
    const threshold = Number(customer.bonusThreshold);
    if (threshold <= 0) continue;

    const paidOmzet = paidOmzetByCustomer.get(customer.id) ?? 0;
    const granted = grantedByCustomer.get(customer.id) ?? 0;
    const available = computeBonusAvailable(paidOmzet, threshold, granted);

    if (available > 0) {
      pelangganHadiah += 1;
    }
  }

  return {
    belumBayarHariIni,
    sudahBayarBulanIni,
    omzetBulanIni,
    pelangganHadiah,
    recentTransactions,
  };
}

const getCachedDashboardSummary = unstable_cache(
  fetchDashboardSummary,
  ["dashboard-summary"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.dashboard],
  }
);

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return getCachedDashboardSummary();
}
