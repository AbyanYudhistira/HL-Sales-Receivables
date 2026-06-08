import { prisma } from "@hl/database";

export async function settleTransaction(
  transactionId: string,
  tanggalPelunasan: Date
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan");
  if (transaction.status === "LUNAS") {
    throw new Error("Transaksi sudah lunas");
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: "LUNAS",
      tanggalPelunasan,
    },
  });
}

export async function settleCustomerMonth(
  customerId: string,
  year: number,
  month: number,
  tanggalPelunasan: Date
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const result = await prisma.transaction.updateMany({
    where: {
      customerId,
      status: "PIUTANG",
      tanggal: { gte: start, lte: end },
    },
    data: {
      status: "LUNAS",
      tanggalPelunasan,
    },
  });

  return result.count;
}
