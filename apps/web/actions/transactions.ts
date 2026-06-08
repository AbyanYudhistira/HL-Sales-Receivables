"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import * as transactionService from "@/lib/services/transactions";

const lineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  isBonusLine: z.boolean().optional(),
});

const transactionSchema = z.object({
  tanggal: z.string().min(1),
  nomorBon: z.string().min(1, "Nomor Bon wajib diisi"),
  customerId: z.string().min(1, "Customer wajib dipilih"),
  ongkir: z.coerce.number().min(0),
  deskripsi: z.string().optional(),
  isBonus: z.coerce.boolean(),
  status: z.enum(["PIUTANG", "LUNAS"]),
  lines: z.array(lineSchema).min(1, "Minimal 1 produk"),
  bonusCount: z.coerce.number().min(0).optional(),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function parseTransactionForm(formData: FormData) {
  return transactionSchema.parse({
    tanggal: formData.get("tanggal"),
    nomorBon: formData.get("nomorBon"),
    customerId: formData.get("customerId"),
    ongkir: formData.get("ongkir"),
    deskripsi: formData.get("deskripsi") || undefined,
    isBonus: formData.get("isBonus") === "true",
    status: formData.get("status"),
    lines: JSON.parse(String(formData.get("lines") ?? "[]")),
    bonusCount: formData.get("bonusCount")
      ? Number(formData.get("bonusCount"))
      : undefined,
  });
}

export async function createTransactionAction(formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseTransactionForm(formData);
    await transactionService.createTransaction({
      ...parsed,
      tanggal: new Date(parsed.tanggal),
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Gagal menyimpan transaksi",
    };
  }
}

export async function updateTransactionAction(id: string, formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseTransactionForm(formData);
    await transactionService.updateTransaction(id, {
      ...parsed,
      tanggal: new Date(parsed.tanggal),
    });
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${id}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Gagal memperbarui transaksi",
    };
  }
}

export async function deleteTransactionAction(id: string) {
  await requireAuth();
  await transactionService.deleteTransaction(id);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
