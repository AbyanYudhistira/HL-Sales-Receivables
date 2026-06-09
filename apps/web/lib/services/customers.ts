import { prisma, type Prisma } from "@hl/database";

import * as transactionService from "@/lib/services/transactions";

export async function listCustomers(search?: string) {
  return prisma.customer.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? { nama: { contains: search, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { nama: "asc" },
  });
}

export async function getCustomersWithSummaries() {
  const customers = await listCustomers();
  const transactions = await prisma.transaction.findMany({
    include: { lines: true },
  });

  const summaries = new Map<
    string,
    { unpaid: number; paid: number; bonusAvailable: number }
  >();

  for (const customer of customers) {
    summaries.set(customer.id, { unpaid: 0, paid: 0, bonusAvailable: 0 });
  }

  for (const tx of transactions) {
    const summary = summaries.get(tx.customerId);
    if (!summary) continue;

    const lineTotal = tx.lines.reduce(
      (sum, line) =>
        line.isBonusLine
          ? sum
          : sum + Number(line.discountedUnitPrice) * line.quantity,
      0
    );
    const owed = lineTotal + Number(tx.ongkir);

    if (tx.status === "PIUTANG") {
      summary.unpaid += owed;
    } else {
      summary.paid += owed;
    }
  }

  return Promise.all(
    customers.map(async (customer) => {
      const summary = summaries.get(customer.id)!;
      const bonusInfo = await transactionService.getCustomerBonusInfo(customer.id);
      return {
        ...customer,
        totalUnpaid: summary.unpaid,
        totalPaid: summary.paid,
        bonusAvailable: bonusInfo.available,
      };
    })
  );
}

export async function getCustomerById(id: string) {
  return prisma.customer.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createCustomer(data: {
  nama: string;
  discountLm: number[];
  discountBr: number[];
  bonusThreshold: number;
}) {
  return prisma.customer.create({
    data: {
      nama: data.nama,
      discountLm: data.discountLm,
      discountBr: data.discountBr,
      bonusThreshold: data.bonusThreshold,
    },
  });
}

export async function updateCustomer(
  id: string,
  data: {
    nama: string;
    discountLm: number[];
    discountBr: number[];
    bonusThreshold: number;
  }
) {
  return prisma.customer.update({
    where: { id },
    data: {
      nama: data.nama,
      discountLm: data.discountLm,
      discountBr: data.discountBr,
      bonusThreshold: data.bonusThreshold,
    },
  });
}

export async function softDeleteCustomer(id: string) {
  return prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCustomerMonthlySummary(
  customerId: string,
  year: number,
  month: number
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      customerId,
      tanggal: { gte: start, lte: end },
    },
    include: {
      lines: { include: { product: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  let totalPiutang = 0;
  let totalDibayar = 0;
  let totalOmzet = 0;
  let totalLaba = 0;
  let omzetLm = 0;
  let omzetBr = 0;

  for (const tx of transactions) {
    const lineOmzet = tx.lines.reduce(
      (sum, line) => sum + Number(line.discountedUnitPrice) * line.quantity,
      0
    );
    const lineLaba = tx.lines.reduce((sum, line) => {
      if (line.isBonusLine) return sum;
      const modal = Number(line.product.hargaModal);
      return sum + (Number(line.discountedUnitPrice) - modal) * line.quantity;
    }, 0);
    const owed = lineOmzet + Number(tx.ongkir);

    if (tx.status === "PIUTANG") {
      totalPiutang += owed;
    } else {
      totalDibayar += owed;
      if (!tx.isBonus) {
        totalOmzet += lineOmzet;
        totalLaba += lineLaba;
        for (const line of tx.lines) {
          if (line.isBonusLine) continue;
          const omzet = Number(line.discountedUnitPrice) * line.quantity;
          if (line.product.tipe === "LM") omzetLm += omzet;
          else omzetBr += omzet;
        }
      }
    }
  }

  return {
    transactions,
    totals: {
      totalPiutang,
      totalDibayar,
      totalOmzet,
      totalLaba,
      omzetLm,
      omzetBr,
    },
  };
}
