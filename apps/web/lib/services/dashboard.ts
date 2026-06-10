import { computeBonusAvailable } from "@hl/calculations";
import { prisma } from "@hl/database";

type LineRow = {
  discountedUnitPrice: unknown;
  quantity: number;
  isBonusLine: boolean;
};

function sumLineOmzet(lines: LineRow[]) {
  return lines.reduce(
    (sum, line) =>
      line.isBonusLine
        ? sum
        : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );
}

function sumOwed(tx: { lines: LineRow[]; ongkir: unknown }) {
  return sumLineOmzet(tx.lines) + Number(tx.ongkir);
}

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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    unpaidToday,
    paidThisMonth,
    recentTransactions,
    customers,
    paidTransactions,
    grantRows,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        status: "PIUTANG",
        tanggal: { gte: todayStart, lt: todayEnd },
      },
      select: {
        ongkir: true,
        lines: {
          select: {
            discountedUnitPrice: true,
            quantity: true,
            isBonusLine: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: {
        status: "LUNAS",
        isBonus: false,
        tanggal: { gte: monthStart },
      },
      select: {
        ongkir: true,
        lines: {
          select: {
            discountedUnitPrice: true,
            quantity: true,
            isBonusLine: true,
          },
        },
      },
    }),
    fetchRecentTransactions(),
    prisma.customer.findMany({
      where: { deletedAt: null },
      select: { id: true, bonusThreshold: true },
    }),
    prisma.transaction.findMany({
      where: { status: "LUNAS", isBonus: false },
      select: {
        customerId: true,
        lines: {
          select: {
            discountedUnitPrice: true,
            quantity: true,
            isBonusLine: true,
          },
        },
      },
    }),
    prisma.bonusGrant.groupBy({
      by: ["customerId"],
      _sum: { bonusCount: true },
    }),
  ]);

  let belumBayarHariIni = 0;
  for (const tx of unpaidToday) {
    belumBayarHariIni += sumOwed(tx);
  }

  let sudahBayarBulanIni = 0;
  let omzetBulanIni = 0;
  for (const tx of paidThisMonth) {
    const lineOmzet = sumLineOmzet(tx.lines);
    sudahBayarBulanIni += lineOmzet + Number(tx.ongkir);
    omzetBulanIni += lineOmzet;
  }

  const paidOmzetByCustomer = new Map<string, number>();
  for (const tx of paidTransactions) {
    const omzet = sumLineOmzet(tx.lines);
    paidOmzetByCustomer.set(
      tx.customerId,
      (paidOmzetByCustomer.get(tx.customerId) ?? 0) + omzet
    );
  }

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
