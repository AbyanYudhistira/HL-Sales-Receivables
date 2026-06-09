import { prisma } from "@hl/database";

function txLineOmzet(lines: { discountedUnitPrice: unknown; quantity: number; isBonusLine: boolean }[]) {
  return lines.reduce(
    (sum, line) =>
      line.isBonusLine
        ? sum
        : sum + Number(line.discountedUnitPrice) * line.quantity,
    0
  );
}

function txLineLaba(
  lines: {
    discountedUnitPrice: unknown;
    quantity: number;
    isBonusLine: boolean;
    product: { hargaModal: unknown; tipe: string };
  }[]
) {
  return lines.reduce((sum, line) => {
    if (line.isBonusLine) return sum;
    return (
      sum +
      (Number(line.discountedUnitPrice) - Number(line.product.hargaModal)) * line.quantity
    );
  }, 0);
}

export async function getReportSummary(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { tanggal: { gte: start, lte: end } },
    include: {
      customer: true,
      lines: { include: { product: true } },
    },
  });

  let totalOmzet = 0;
  let totalLaba = 0;
  let totalUnpaid = 0;
  let totalPaid = 0;
  let omzetLm = 0;
  let omzetBr = 0;
  let labaLm = 0;
  let labaBr = 0;

  const byCustomer = new Map<
    string,
    { nama: string; omzet: number; laba: number; unpaid: number; paid: number }
  >();

  for (const tx of transactions) {
    const omzet = txLineOmzet(tx.lines);
    const laba = txLineLaba(tx.lines);
    const owed = omzet + Number(tx.ongkir);

    if (tx.status === "PIUTANG") {
      totalUnpaid += owed;
    } else {
      totalPaid += owed;
      if (!tx.isBonus) {
        totalOmzet += omzet;
        totalLaba += laba;
        for (const line of tx.lines) {
          if (line.isBonusLine) continue;
          const lineOmzet = Number(line.discountedUnitPrice) * line.quantity;
          const lineLaba =
            (Number(line.discountedUnitPrice) - Number(line.product.hargaModal)) *
            line.quantity;
          if (line.product.tipe === "LM") {
            omzetLm += lineOmzet;
            labaLm += lineLaba;
          } else {
            omzetBr += lineOmzet;
            labaBr += lineLaba;
          }
        }
      }
    }

    const existing = byCustomer.get(tx.customerId) ?? {
      nama: tx.customer.nama,
      omzet: 0,
      laba: 0,
      unpaid: 0,
      paid: 0,
    };

    if (tx.status === "PIUTANG") existing.unpaid += owed;
    else {
      existing.paid += owed;
      if (!tx.isBonus) {
        existing.omzet += omzet;
        existing.laba += laba;
      }
    }

    byCustomer.set(tx.customerId, existing);
  }

  return {
    totals: { totalOmzet, totalLaba, totalUnpaid, totalPaid, omzetLm, omzetBr },
    byCustomer: Array.from(byCustomer.values()).sort((a, b) => a.nama.localeCompare(b.nama)),
    byType: [
      { tipe: "LM", omzet: omzetLm, laba: labaLm },
      { tipe: "BR", omzet: omzetBr, laba: labaBr },
    ],
  };
}
