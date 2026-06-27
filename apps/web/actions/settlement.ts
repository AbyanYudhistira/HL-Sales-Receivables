"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { formatActionError } from "@/lib/action-error";
import { revalidateSalesData } from "@/lib/cache-tags";
import * as settlementService from "@/lib/services/settlement";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function settleTransactionAction(
  transactionId: string,
  tanggalPelunasan: string
) {
  try {
    await requireAuth();
    const date = z.coerce.date().parse(tanggalPelunasan);
    await settlementService.settleTransaction(transactionId, date);

    revalidateSalesData();
    revalidatePath("/transactions");
    revalidatePath("/customers");
    revalidatePath("/laporan");
    revalidatePath(`/transactions/${transactionId}`);
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menandai bon sudah bayar"),
    };
  }
}

export async function settleMonthAction(
  customerId: string,
  year: number,
  month: number,
  tanggalPelunasan: string
) {
  try {
    await requireAuth();
    const date = z.coerce.date().parse(tanggalPelunasan);
    const count = await settlementService.settleCustomerMonth(
      customerId,
      year,
      month,
      date
    );

    revalidateSalesData();
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/customers");
    revalidatePath("/laporan");
    revalidatePath("/");
    revalidatePath("/transactions");

    return { success: true as const, count };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menandai bulan sudah bayar"),
    };
  }
}
