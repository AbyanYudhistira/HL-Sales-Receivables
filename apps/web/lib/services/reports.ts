import { prisma } from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";

export type ReportSummary = {
  totals: {
    totalOmzet: number;
    totalLaba: number;
    totalUnpaid: number;
    totalPaid: number;
    omzetLm: number;
    omzetBr: number;
  };
  byCustomer: {
    nama: string;
    omzet: number;
    laba: number;
    unpaid: number;
    paid: number;
  }[];
  byType: { tipe: string; omzet: number; laba: number }[];
};

async function fetchReportSummary(
  year: number,
  month: number
): Promise<ReportSummary> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [byCustomerRows, byTypeRows] = await Promise.all([
    prisma.$queryRaw<
      {
        nama: string;
        omzet: unknown;
        laba: unknown;
        unpaid: unknown;
        paid: unknown;
      }[]
    >`
      WITH tx_totals AS (
        SELECT
          t.id,
          t."customerId",
          c.nama AS "customerName",
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
        INNER JOIN "Customer" c ON c.id = t."customerId"
        LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
        LEFT JOIN "Product" p ON p.id = tl."productId"
        WHERE t.tanggal >= ${start}::date
          AND t.tanggal <= ${end}::date
        GROUP BY
          t.id,
          t."customerId",
          c.nama,
          t.status,
          t."isBonus",
          t.ongkir
      )
      SELECT
        "customerName" AS nama,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus" AND NOT "isBonus"
              THEN line_omzet
              ELSE 0
            END
          ),
          0
        ) AS omzet,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus" AND NOT "isBonus"
              THEN line_laba
              ELSE 0
            END
          ),
          0
        ) AS laba,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'PIUTANG'::"TransactionStatus"
              THEN line_omzet + ongkir
              ELSE 0
            END
          ),
          0
        ) AS unpaid,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'LUNAS'::"TransactionStatus"
              THEN line_omzet + ongkir
              ELSE 0
            END
          ),
          0
        ) AS paid
      FROM tx_totals
      GROUP BY "customerId", "customerName"
      ORDER BY nama ASC
    `,
    prisma.$queryRaw<{ tipe: string; omzet: unknown; laba: unknown }[]>`
      SELECT
        p.tipe::text AS tipe,
        COALESCE(SUM(tl."discountedUnitPrice" * tl.quantity), 0) AS omzet,
        COALESCE(
          SUM((tl."discountedUnitPrice" - p."hargaModal") * tl.quantity),
          0
        ) AS laba
      FROM "TransactionLine" tl
      INNER JOIN "Transaction" t ON t.id = tl."transactionId"
      INNER JOIN "Product" p ON p.id = tl."productId"
      WHERE t.tanggal >= ${start}::date
        AND t.tanggal <= ${end}::date
        AND t.status = 'LUNAS'::"TransactionStatus"
        AND t."isBonus" = false
        AND tl."isBonusLine" = false
      GROUP BY p.tipe
    `,
  ]);

  const byCustomer = byCustomerRows.map((row) => ({
    nama: row.nama,
    omzet: Number(row.omzet),
    laba: Number(row.laba),
    unpaid: Number(row.unpaid),
    paid: Number(row.paid),
  }));

  const byType = byTypeRows.map((row) => ({
    tipe: row.tipe,
    omzet: Number(row.omzet),
    laba: Number(row.laba),
  }));

  const omzetLm = byType.find((row) => row.tipe === "LM")?.omzet ?? 0;
  const omzetBr = byType.find((row) => row.tipe === "BR")?.omzet ?? 0;
  const labaLm = byType.find((row) => row.tipe === "LM")?.laba ?? 0;
  const labaBr = byType.find((row) => row.tipe === "BR")?.laba ?? 0;

  return {
    totals: {
      totalOmzet: byCustomer.reduce((sum, row) => sum + row.omzet, 0),
      totalLaba: byCustomer.reduce((sum, row) => sum + row.laba, 0),
      totalUnpaid: byCustomer.reduce((sum, row) => sum + row.unpaid, 0),
      totalPaid: byCustomer.reduce((sum, row) => sum + row.paid, 0),
      omzetLm,
      omzetBr,
    },
    byCustomer,
    byType: [
      { tipe: "LM", omzet: omzetLm, laba: labaLm },
      { tipe: "BR", omzet: omzetBr, laba: labaBr },
    ],
  };
}

const getCachedReportSummary = unstable_cache(
  fetchReportSummary,
  ["report-summary"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.reports],
  }
);

export async function getReportSummary(
  year: number,
  month: number
): Promise<ReportSummary> {
  return getCachedReportSummary(year, month);
}
