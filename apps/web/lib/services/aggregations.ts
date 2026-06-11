import { prisma } from "@hl/database";

export async function getPaidOmzetByCustomerMap(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ customerId: string; omzet: unknown }[]>`
    SELECT
      t."customerId",
      COALESCE(
        SUM(
          CASE
            WHEN tl."isBonusLine" THEN 0
            ELSE tl."discountedUnitPrice" * tl.quantity
          END
        ),
        0
      ) AS omzet
    FROM "Transaction" t
    LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
    WHERE t.status = 'LUNAS'::"TransactionStatus"
      AND t."isBonus" = false
    GROUP BY t."customerId"
  `;

  return new Map(rows.map((row) => [row.customerId, Number(row.omzet)]));
}

export async function getCustomerPaidOmzet(customerId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ omzet: unknown }[]>`
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN tl."isBonusLine" THEN 0
            ELSE tl."discountedUnitPrice" * tl.quantity
          END
        ),
        0
      ) AS omzet
    FROM "Transaction" t
    LEFT JOIN "TransactionLine" tl ON tl."transactionId" = t.id
    WHERE t."customerId" = ${customerId}
      AND t.status = 'LUNAS'::"TransactionStatus"
      AND t."isBonus" = false
  `;

  return Number(rows[0]?.omzet ?? 0);
}

export async function sumPiutangForDateRange(
  start: Date,
  end: Date
): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: unknown }[]>`
    WITH tx_totals AS (
      SELECT
        t.id,
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
      WHERE t.status = 'PIUTANG'::"TransactionStatus"
        AND t.tanggal >= ${start}::date
        AND t.tanggal < ${end}::date
      GROUP BY t.id, t.ongkir
    )
    SELECT COALESCE(SUM(line_total + ongkir), 0) AS total
    FROM tx_totals
  `;

  return Number(rows[0]?.total ?? 0);
}

export async function sumLunasFromDate(monthStart: Date): Promise<{
  totalPaid: number;
  omzet: number;
}> {
  const rows = await prisma.$queryRaw<{ totalPaid: unknown; omzet: unknown }[]>`
    WITH tx_totals AS (
      SELECT
        t.id,
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
      WHERE t.status = 'LUNAS'::"TransactionStatus"
        AND t."isBonus" = false
        AND t.tanggal >= ${monthStart}::date
      GROUP BY t.id, t.ongkir
    )
    SELECT
      COALESCE(SUM(line_total + ongkir), 0) AS "totalPaid",
      COALESCE(SUM(line_total), 0) AS omzet
    FROM tx_totals
  `;

  const row = rows[0];
  return {
    totalPaid: Number(row?.totalPaid ?? 0),
    omzet: Number(row?.omzet ?? 0),
  };
}
