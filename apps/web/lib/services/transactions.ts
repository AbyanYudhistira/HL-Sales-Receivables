import {
  computeBonusAvailable,
  computeTransactionTotals,
} from "@hl/calculations";
import { prisma, type ProductType, type TransactionStatus } from "@hl/database";

import { parseDiscountSteps } from "@/lib/format-idr";

export interface TransactionLineInput {
  productId: string;
  quantity: number;
  isBonusLine?: boolean;
}

export async function listTransactions(filters?: {
  customerId?: string;
  status?: TransactionStatus;
  year?: number;
  month?: number;
}) {
  const dateFilter =
    filters?.year && filters?.month
      ? {
          gte: new Date(filters.year, filters.month - 1, 1),
          lte: new Date(filters.year, filters.month, 0, 23, 59, 59),
        }
      : undefined;

  return prisma.transaction.findMany({
    where: {
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(dateFilter ? { tanggal: dateFilter } : {}),
    },
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
    orderBy: { tanggal: "desc" },
  });
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { include: { product: true } },
      bonusGrant: true,
    },
  });
}

async function buildLineComputations(
  customerId: string,
  lines: TransactionLineInput[],
  isBonusTransaction: boolean
) {
  const customer = await prisma.customer.findFirstOrThrow({
    where: { id: customerId, deletedAt: null },
  });

  const productIds = lines.map((l) => l.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deletedAt: null },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineInputs = lines.map((line) => {
    const product = productMap.get(line.productId);
    if (!product) throw new Error("Produk tidak ditemukan");

    const discountSteps = parseDiscountSteps(
      product.tipe === "LM" ? customer.discountLm : customer.discountBr
    );

    const isBonusLine = isBonusTransaction || line.isBonusLine === true;

    return {
      basePrice: Number(product.hargaBase),
      hargaModal: Number(product.hargaModal),
      quantity: line.quantity,
      discountSteps,
      isBonusLine,
      productId: line.productId,
      productType: product.tipe as ProductType,
    };
  });

  return lineInputs;
}

export async function createTransaction(data: {
  tanggal: Date;
  nomorBon: string;
  customerId: string;
  ongkir: number;
  deskripsi?: string;
  isBonus: boolean;
  status: TransactionStatus;
  lines: TransactionLineInput[];
  bonusCount?: number;
}) {
  const existing = await prisma.transaction.findUnique({
    where: { nomorBon: data.nomorBon },
  });
  if (existing) {
    throw new Error("No. bon ini sudah dipakai.");
  }

  const lineInputs = await buildLineComputations(
    data.customerId,
    data.lines,
    data.isBonus
  );

  const totals = computeTransactionTotals(
    lineInputs.map(({ basePrice, hargaModal, quantity, discountSteps, isBonusLine }) => ({
      basePrice,
      hargaModal,
      quantity,
      discountSteps,
      isBonusLine,
    })),
    data.ongkir
  );

  if (data.isBonus && data.bonusCount) {
    const paidOmzet = await getCustomerPaidOmzet(data.customerId);
    const granted = await getCustomerBonusGrantedCount(data.customerId);
    const available = computeBonusAvailable(
      paidOmzet,
      Number(
        (
          await prisma.customer.findUniqueOrThrow({ where: { id: data.customerId } })
        ).bonusThreshold
      ),
      granted
    );
    if (data.bonusCount > available) {
      throw new Error(`Bonus tersedia hanya ${available}`);
    }
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        tanggal: data.tanggal,
        nomorBon: data.nomorBon,
        customerId: data.customerId,
        ongkir: data.ongkir,
        deskripsi: data.deskripsi,
        isBonus: data.isBonus,
        status: data.status,
        tanggalPelunasan: data.status === "LUNAS" ? data.tanggal : null,
        lines: {
          create: lineInputs.map((input, index) => ({
            productId: input.productId,
            quantity: input.quantity,
            discountedUnitPrice: totals.lines[index].discountedUnitPrice.toNumber(),
            isBonusLine: input.isBonusLine ?? false,
          })),
        },
      },
      include: { lines: true },
    });

    if (data.isBonus && data.bonusCount && data.bonusCount > 0) {
      await tx.bonusGrant.create({
        data: {
          customerId: data.customerId,
          transactionId: transaction.id,
          bonusCount: data.bonusCount,
        },
      });
    }

    return transaction;
  });
}

export async function updateTransaction(
  id: string,
  data: {
    tanggal: Date;
    nomorBon: string;
    customerId: string;
    ongkir: number;
    deskripsi?: string;
    isBonus: boolean;
    status: TransactionStatus;
    lines: TransactionLineInput[];
  }
) {
  const existing = await prisma.transaction.findFirst({
    where: { nomorBon: data.nomorBon, NOT: { id } },
  });
  if (existing) throw new Error("No. bon ini sudah dipakai.");

  const lineInputs = await buildLineComputations(
    data.customerId,
    data.lines,
    data.isBonus
  );

  const totals = computeTransactionTotals(
    lineInputs.map(({ basePrice, hargaModal, quantity, discountSteps, isBonusLine }) => ({
      basePrice,
      hargaModal,
      quantity,
      discountSteps,
      isBonusLine,
    })),
    data.ongkir
  );

  return prisma.$transaction(async (tx) => {
    await tx.transactionLine.deleteMany({ where: { transactionId: id } });

    return tx.transaction.update({
      where: { id },
      data: {
        tanggal: data.tanggal,
        nomorBon: data.nomorBon,
        customerId: data.customerId,
        ongkir: data.ongkir,
        deskripsi: data.deskripsi,
        isBonus: data.isBonus,
        status: data.status,
        tanggalPelunasan:
          data.status === "LUNAS"
            ? (
                await tx.transaction.findUnique({ where: { id } })
              )?.tanggalPelunasan ?? data.tanggal
            : null,
        lines: {
          create: lineInputs.map((input, index) => ({
            productId: input.productId,
            quantity: input.quantity,
            discountedUnitPrice: totals.lines[index].discountedUnitPrice.toNumber(),
            isBonusLine: input.isBonusLine ?? false,
          })),
        },
      },
      include: { lines: { include: { product: true } }, customer: true },
    });
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

type BonusLineRow = {
  discountedUnitPrice: unknown;
  quantity: number;
  isBonusLine: boolean;
};

function sumLineOmzet(lines: BonusLineRow[]) {
  return lines.reduce(
    (sum, line) =>
      line.isBonusLine
        ? sum
        : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );
}

export async function getBonusAvailableMap(
  customers: { id: string; bonusThreshold: unknown }[]
) {
  const [paidTransactions, grantRows] = await Promise.all([
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

  const result = new Map<string, number>();
  for (const customer of customers) {
    const threshold = Number(customer.bonusThreshold);
    if (threshold <= 0) {
      result.set(customer.id, 0);
      continue;
    }

    const paidOmzet = paidOmzetByCustomer.get(customer.id) ?? 0;
    const granted = grantedByCustomer.get(customer.id) ?? 0;
    result.set(
      customer.id,
      computeBonusAvailable(paidOmzet, threshold, granted)
    );
  }

  return result;
}

export async function getCustomerPaidOmzet(customerId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { customerId, status: "LUNAS", isBonus: false },
    include: { lines: true },
  });

  return transactions.reduce((sum, tx) => {
    const omzet = tx.lines.reduce(
      (lineSum, line) =>
        line.isBonusLine
          ? lineSum
          : lineSum + Number(line.discountedUnitPrice) * line.quantity,
      0
    );
    return sum + omzet;
  }, 0);
}

export async function getCustomerBonusGrantedCount(customerId: string) {
  const result = await prisma.bonusGrant.aggregate({
    where: { customerId },
    _sum: { bonusCount: true },
  });
  return result._sum.bonusCount ?? 0;
}

export async function getCustomerBonusInfo(customerId: string) {
  const [customer, paidOmzet, granted] = await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId } }),
    getCustomerPaidOmzet(customerId),
    getCustomerBonusGrantedCount(customerId),
  ]);

  const available = computeBonusAvailable(
    paidOmzet,
    Number(customer.bonusThreshold),
    granted
  );

  return { paidOmzet, granted, available, threshold: Number(customer.bonusThreshold) };
}
