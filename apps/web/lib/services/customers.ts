import { prisma } from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";

import * as transactionService from "@/lib/services/transactions";

async function fetchCustomerOptions() {
  return prisma.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });
}

const getCachedCustomerOptions = unstable_cache(
  fetchCustomerOptions,
  ["customer-options"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.transactionsList, CACHE_TAGS.transactionForm],
  }
);

export async function listCustomerOptions() {
  return getCachedCustomerOptions();
}

async function fetchCustomers() {
  return prisma.customer.findMany({
    where: { deletedAt: null },
    orderBy: { nama: "asc" },
  });
}

const getCachedCustomers = unstable_cache(fetchCustomers, ["customers-list"], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.transactionForm],
});

export async function listCustomers(search?: string) {
  if (search) {
    return prisma.customer.findMany({
      where: {
        deletedAt: null,
        nama: { contains: search, mode: "insensitive" as const },
      },
      orderBy: { nama: "asc" },
    });
  }

  return getCachedCustomers();
}

async function fetchCustomersWithSummaries() {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, nama: true, bonusThreshold: true },
    orderBy: { nama: "asc" },
  });

  const [summaryRows, bonusMap] = await Promise.all([
    prisma.$queryRaw<
      {
        id: string;
        nama: string;
        totalUnpaid: unknown;
        totalPaid: unknown;
      }[]
    >`
      WITH tx_totals AS (
        SELECT
          t.id,
          t."customerId",
          t.status,
          t.ongkir,
          COALESCE(
            SUM(
              CASE
                WHEN tl."isBonusLine" THEN 0
                ELSE tl."discountedUnitPrice" * tl.quantity
              END
            ),
            0
          ) AS line_total
        FROM "Transaction" t
        LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
        GROUP BY t.id, t."customerId", t.status, t.ongkir
      )
      SELECT
        c.id,
        c.nama,
        COALESCE(
          SUM(
            CASE
              WHEN tt.status = 'PIUTANG'::"TransactionStatus"
              THEN tt.line_total + tt.ongkir
              ELSE 0
            END
          ),
          0
        ) AS "totalUnpaid",
        COALESCE(
          SUM(
            CASE
              WHEN tt.status = 'LUNAS'::"TransactionStatus"
              THEN tt.line_total + tt.ongkir
              ELSE 0
            END
          ),
          0
        ) AS "totalPaid"
      FROM "Customer" c
      LEFT JOIN tx_totals tt ON tt."customerId" = c.id
      WHERE c."deletedAt" IS NULL
      GROUP BY c.id, c.nama
      ORDER BY c.nama ASC
    `,
    transactionService.getBonusAvailableMap(customers),
  ]);

  const summaryById = new Map(summaryRows.map((row) => [row.id, row]));

  return customers.map((customer) => {
    const summary = summaryById.get(customer.id);
    return {
      id: customer.id,
      nama: customer.nama,
      totalUnpaid: Number(summary?.totalUnpaid ?? 0),
      totalPaid: Number(summary?.totalPaid ?? 0),
      bonusAvailable: bonusMap.get(customer.id) ?? 0,
    };
  });
}

const getCachedCustomersWithSummaries = unstable_cache(
  fetchCustomersWithSummaries,
  ["customers-with-summaries"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.customersSummary],
  }
);

export async function getCustomersWithSummaries() {
  return getCachedCustomersWithSummaries();
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

export type CustomerMonthlyTotals = {
  totalPiutang: number;
  totalDibayar: number;
  totalOmzet: number;
  totalLaba: number;
  omzetLm: number;
  omzetBr: number;
};

export type CustomerMonthlyTransaction = {
  id: string;
  nomorBon: string;
  tanggal: string;
  status: "PIUTANG" | "LUNAS";
  isBonus: boolean;
  total: number;
};

export async function getCustomerMonthlySummary(
  customerId: string,
  year: number,
  month: number
): Promise<{
  transactions: CustomerMonthlyTransaction[];
  totals: CustomerMonthlyTotals;
}> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [transactionResult, totalsRows, typeRows] = await Promise.all([
    transactionService.listTransactionsForTable({
      year,
      month,
      customerId,
    }),
    prisma.$queryRaw<
      {
        totalPiutang: unknown;
        totalDibayar: unknown;
        totalOmzet: unknown;
        totalLaba: unknown;
      }[]
    >`
      WITH tx_totals AS (
        SELECT
          t.id,
          t.status,
          t."isBonus",
          t.ongkir,
          COALESCE(
            SUM(
              CASE
                WHEN tl."isBonusLine" THEN 0
                ELSE tl."discountedUnitPrice" * tl.quantity
              END
            ),
            0
          ) AS line_omzet,
          COALESCE(
            SUM(
              CASE
                WHEN tl."isBonusLine" THEN 0
                ELSE (tl."discountedUnitPrice" - p."hargaModal") * tl.quantity
              END
            ),
            0
          ) AS line_laba
        FROM "Transaction" t
        LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
        LEFT JOIN "Product" p ON p.id = tl."productId"
        WHERE t."customerId" = ${customerId}
          AND t.tanggal >= ${start}::date
          AND t.tanggal <= ${end}::date
        GROUP BY t.id, t.status, t."isBonus", t.ongkir
      )
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'PIUTANG'::"TransactionStatus"
              THEN line_omzet + ongkir
              ELSE 0
            END
          ),
          0
        ) AS "totalPiutang",
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus"
              THEN line_omzet + ongkir
              ELSE 0
            END
          ),
          0
        ) AS "totalDibayar",
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus" AND NOT "isBonus"
              THEN line_omzet
              ELSE 0
            END
          ),
          0
        ) AS "totalOmzet",
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus" AND NOT "isBonus"
              THEN line_laba
              ELSE 0
            END
          ),
          0
        ) AS "totalLaba"
      FROM tx_totals
    `,
    prisma.$queryRaw<{ tipe: string; omzet: unknown }[]>`
      SELECT
        p.tipe::text AS tipe,
        COALESCE(SUM(tl."discountedUnitPrice" * tl.quantity), 0) AS omzet
      FROM "TransactionLine" tl
      INNER JOIN "Transaction" t ON t.id = tl."transactionId"
      INNER JOIN "Product" p ON p.id = tl."productId"
      WHERE t."customerId" = ${customerId}
        AND t.tanggal >= ${start}::date
        AND t.tanggal <= ${end}::date
        AND t.status = 'LUNAS'::"TransactionStatus"
        AND t."isBonus" = false
        AND tl."isBonusLine" = false
      GROUP BY p.tipe
    `,
  ]);

  const totalsRow = totalsRows[0];

  return {
    transactions: transactionResult.rows.map((tx) => ({
      id: tx.id,
      nomorBon: tx.nomorBon,
      tanggal: tx.tanggal,
      status: tx.status,
      isBonus: tx.isBonus,
      total: tx.total,
    })),
    totals: {
      totalPiutang: Number(totalsRow?.totalPiutang ?? 0),
      totalDibayar: Number(totalsRow?.totalDibayar ?? 0),
      totalOmzet: Number(totalsRow?.totalOmzet ?? 0),
      totalLaba: Number(totalsRow?.totalLaba ?? 0),
      omzetLm: Number(typeRows.find((row) => row.tipe === "LM")?.omzet ?? 0),
      omzetBr: Number(typeRows.find((row) => row.tipe === "BR")?.omzet ?? 0),
    },
  };
}
