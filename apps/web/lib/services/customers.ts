import { prisma, type Prisma } from "@hl/database";

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
