import { z } from "zod";

import { parseJsonArrayFromForm } from "@/lib/action-error";

export const transactionLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  isBonusLine: z.boolean().optional(),
});

export const transactionSchema = z.object({
  tanggal: z.string().min(1),
  nomorBon: z.string().min(1, "Nomor Bon wajib diisi"),
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  ongkir: z.coerce.number().min(0),
  deskripsi: z.string().optional(),
  isBonus: z.coerce.boolean(),
  status: z.enum(["PIUTANG", "LUNAS"]),
  lines: z.array(transactionLineSchema).min(1, "Minimal 1 produk"),
  bonusCount: z.coerce.number().min(0).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export function parseTransactionFromForm(formData: FormData) {
  return transactionSchema.parse({
    tanggal: formData.get("tanggal"),
    nomorBon: formData.get("nomorBon"),
    customerId: formData.get("customerId"),
    ongkir: formData.get("ongkir"),
    deskripsi: formData.get("deskripsi") || undefined,
    isBonus: formData.get("isBonus") === "true",
    status: formData.get("status"),
    lines: parseJsonArrayFromForm(formData, "lines"),
    bonusCount: formData.get("bonusCount")
      ? Number(formData.get("bonusCount"))
      : undefined,
  });
}
