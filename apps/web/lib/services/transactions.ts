import {
  computeBonusAvailable,
  computeTransactionTotals,
} from "@hl/calculations";
import {
  Prisma,
  prisma,
  type ProductType,
  type TransactionStatus,
} from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { parseDiscountSteps } from "@/lib/format-idr";

import {
  getCustomerPaidOmzet as getCustomerPaidOmzetFromDb,
  getPaidOmzetByCustomerMap,
} from "./aggregations";

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

export const TRANSACTIONS_PAGE_SIZE = 20;

export type TransactionTableRow = {
  id: string;
  nomorBon: string;
  customerId: string;
  customerName: string;
  tanggal: Date;
  total: number;
  status: TransactionStatus;
  isBonus: boolean;
};

export type TransactionTableResult = {
  rows: TransactionTableRow[];
  totalCount: number;
};

type TransactionTableFilters = {
  year: number;
  month: number;
  customerId?: string;
  status?: TransactionStatus;
  page?: number;
  pageSize?: number;
};

function buildTransactionTableFilters(filters: TransactionTableFilters) {
  const start = new Date(filters.year, filters.month - 1, 1);
  const end = new Date(filters.year, filters.month, 0, 23, 59, 59);

  const customerFilter = filters.customerId
    ? Prisma.sql`AND t."customerId" = ${filters.customerId}`
    : Prisma.empty;

  const statusFilter = filters.status
    ? Prisma.sql`AND t.status = ${filters.status}::"TransactionStatus"`
    : Prisma.empty;

  return { start, end, customerFilter, statusFilter };
}

async function fetchTransactionsForTable(
  filters: TransactionTableFilters
): Promise<TransactionTableResult> {
  const { start, end, customerFilter, statusFilter } =
    buildTransactionTableFilters(filters);
  const page = filters.page;
  const pageSize = filters.pageSize ?? TRANSACTIONS_PAGE_SIZE;
  const paginate = page !== undefined;

  const [countRows, rows] = await Promise.all([
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM "Transaction" t
      WHERE t.tanggal >= ${start}::date
        AND t.tanggal <= ${end}::date
        ${customerFilter}
        ${statusFilter}
    `,
    prisma.$queryRaw<
    {
      id: string;
      nomorBon: string;
      customerId: string;
      customerName: string;
      tanggal: Date;
      lineTotal: unknown;
      ongkir: unknown;
      status: TransactionStatus;
      isBonus: boolean;
    }[]
  >`
    SELECT
      t.id,
      t."nomorBon",
      t."customerId",
      c.nama AS "customerName",
      t.tanggal,
      t.ongkir,
      t.status,
      t."isBonus",
      COALESCE(
        SUM(
          CASE
            WHEN tl."isBonusLine" THEN 0
            ELSE tl."discountedUnitPrice" * tl.quantity
          END
        ),
        0
      ) AS "lineTotal"
    FROM "Transaction" t
    INNER JOIN "Customer" c ON c.id = t."customerId"
    LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
    WHERE t.tanggal >= ${start}::date
      AND t.tanggal <= ${end}::date
      ${customerFilter}
      ${statusFilter}
    GROUP BY
      t.id,
      t."nomorBon",
      t."customerId",
      c.nama,
      t.tanggal,
      t.ongkir,
      t.status,
      t."isBonus"
    ORDER BY t.tanggal DESC
    ${paginate ? Prisma.sql`LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}` : Prisma.empty}
  `,
  ]);

  const mappedRows = rows.map((row) => ({
    id: row.id,
    nomorBon: row.nomorBon,
    customerId: row.customerId,
    customerName: row.customerName,
    tanggal: row.tanggal,
    total: Number(row.lineTotal) + Number(row.ongkir),
    status: row.status,
    isBonus: row.isBonus,
  }));

  return {
    rows: mappedRows,
    totalCount: Number(countRows[0]?.count ?? 0),
  };
}

const getCachedTransactionsForTable = unstable_cache(
  fetchTransactionsForTable,
  ["transactions-for-table"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.transactionsList],
  }
);

export async function listTransactionsForTable(
  filters: TransactionTableFilters
): Promise<TransactionTableResult> {
  return getCachedTransactionsForTable(filters);
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

async function buildBonusAvailableMap(
  customers: { id: string; bonusThreshold: unknown }[]
): Promise<Map<string, number>> {
  const [paidOmzetByCustomer, grantRows] = await Promise.all([
    getPaidOmzetByCustomerMap(),
    prisma.bonusGrant.groupBy({
      by: ["customerId"],
      _sum: { bonusCount: true },
    }),
  ]);

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

async function fetchAllBonusAvailableMap(): Promise<Record<string, number>> {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, bonusThreshold: true },
  });
  const map = await buildBonusAvailableMap(customers);
  return Object.fromEntries(map);
}

const getCachedAllBonusAvailableMap = unstable_cache(
  fetchAllBonusAvailableMap,
  ["bonus-available-map"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.transactionForm, CACHE_TAGS.customersSummary],
  }
);

export async function getBonusAvailableMap(
  customers: { id: string; bonusThreshold: unknown }[]
) {
  const cached = await getCachedAllBonusAvailableMap();
  const result = new Map<string, number>();

  for (const customer of customers) {
    if (customer.id in cached) {
      result.set(customer.id, cached[customer.id]);
      continue;
    }

    const threshold = Number(customer.bonusThreshold);
    if (threshold <= 0) {
      result.set(customer.id, 0);
      continue;
    }

    const map = await buildBonusAvailableMap([customer]);
    result.set(customer.id, map.get(customer.id) ?? 0);
  }

  return result;
}

export async function getCustomerPaidOmzet(customerId: string) {
  return getCustomerPaidOmzetFromDb(customerId);
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
