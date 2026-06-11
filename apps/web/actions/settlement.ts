"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
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
  await requireAuth();

  const date = z.coerce.date().parse(tanggalPelunasan);
  await settlementService.settleTransaction(transactionId, date);

  revalidateSalesData();
  revalidatePath("/transactions");
  revalidatePath("/customers");
  revalidatePath("/laporan");
  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath("/");
}

export async function settleMonthAction(
  customerId: string,
  year: number,
  month: number,
  tanggalPelunasan: string
) {
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

  return count;
}
