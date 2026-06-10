"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getReturnTo } from "@/lib/safe-return-path";
import * as customerService from "@/lib/services/customers";

const customerSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  discountLm: z.array(z.coerce.number().min(0).max(100)),
  discountBr: z.array(z.coerce.number().min(0).max(100)),
  bonusThreshold: z.coerce.number().min(0),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function createCustomerAction(formData: FormData) {
  await requireAuth();

  const parsed = customerSchema.parse({
    nama: formData.get("nama"),
    discountLm: JSON.parse(String(formData.get("discountLm") ?? "[]")),
    discountBr: JSON.parse(String(formData.get("discountBr") ?? "[]")),
    bonusThreshold: formData.get("bonusThreshold"),
  });

  const customer = await customerService.createCustomer(parsed);
  revalidatePath("/customers");

  if (formData.get("modal") === "true") {
    return { success: true as const, id: customer.id };
  }

  redirect(getReturnTo(formData, "/customers"));
}

export async function saveCustomerAction(formData: FormData) {
  await requireAuth();

  const parsed = customerSchema.parse({
    nama: formData.get("nama"),
    discountLm: JSON.parse(String(formData.get("discountLm") ?? "[]")),
    discountBr: JSON.parse(String(formData.get("discountBr") ?? "[]")),
    bonusThreshold: formData.get("bonusThreshold"),
  });

  const customer = await customerService.createCustomer(parsed);
  revalidatePath("/customers");
  return { success: true as const, id: customer.id };
}

export async function updateCustomerAction(id: string, formData: FormData) {
  await requireAuth();

  const parsed = customerSchema.parse({
    nama: formData.get("nama"),
    discountLm: JSON.parse(String(formData.get("discountLm") ?? "[]")),
    discountBr: JSON.parse(String(formData.get("discountBr") ?? "[]")),
    bonusThreshold: formData.get("bonusThreshold"),
  });

  await customerService.updateCustomer(id, parsed);
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);

  if (formData.get("modal") === "true") {
    return { success: true as const };
  }

  redirect(getReturnTo(formData, `/customers/${id}`));
}

export async function deleteCustomerAction(id: string) {
  await requireAuth();
  await customerService.softDeleteCustomer(id);
  revalidatePath("/customers");
}
