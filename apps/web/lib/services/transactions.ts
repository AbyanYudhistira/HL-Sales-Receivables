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
}) {
  return prisma.transaction.findMany({
    where: {
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: {
      customer: true,
      lines: { include: { product: true } },
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
    throw new Error("Nomor Bon sudah digunakan");
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
  if (existing) throw new Error("Nomor Bon sudah digunakan");

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
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
  });
  const paidOmzet = await getCustomerPaidOmzet(customerId);
  const granted = await getCustomerBonusGrantedCount(customerId);
  const available = computeBonusAvailable(
    paidOmzet,
    Number(customer.bonusThreshold),
    granted
  );

  return { paidOmzet, granted, available, threshold: Number(customer.bonusThreshold) };
}
