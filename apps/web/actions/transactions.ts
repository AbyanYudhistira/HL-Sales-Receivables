"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { formatActionError } from "@/lib/action-error";
import { revalidateSalesData } from "@/lib/cache-tags";
import { parseTransactionFromForm } from "@/lib/schemas/transaction";
import * as transactionService from "@/lib/services/transactions";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function createTransactionAction(formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseTransactionFromForm(formData);
    const created = await transactionService.createTransaction({
      ...parsed,
      tanggal: new Date(parsed.tanggal),
    });
    revalidateSalesData();
    revalidatePath("/transactions");
    revalidatePath("/customers");
    revalidatePath("/laporan");
    revalidatePath("/");
    return { success: true as const, id: created.id };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menyimpan transaksi"),
    };
  }
}

export async function updateTransactionAction(id: string, formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseTransactionFromForm(formData);
    await transactionService.updateTransaction(id, {
      ...parsed,
      tanggal: new Date(parsed.tanggal),
    });
    revalidateSalesData();
    revalidatePath("/transactions");
    revalidatePath("/customers");
    revalidatePath("/laporan");
    revalidatePath(`/transactions/${id}`);
    revalidatePath("/");
    return { success: true as const, id };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal memperbarui transaksi"),
    };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await requireAuth();
    await transactionService.deleteTransaction(id);
    revalidateSalesData();
    revalidatePath("/transactions");
    revalidatePath("/customers");
    revalidatePath("/laporan");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menghapus transaksi"),
    };
  }
}
