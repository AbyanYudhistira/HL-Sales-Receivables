"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { formatActionError } from "@/lib/action-error";
import { revalidateSalesData } from "@/lib/cache-tags";
import { parseCustomerFromForm } from "@/lib/schemas/customer";
import { getReturnTo } from "@/lib/safe-return-path";
import * as customerService from "@/lib/services/customers";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function createCustomerAction(formData: FormData) {
  await requireAuth();

  let customerId: string;
  try {
    const parsed = parseCustomerFromForm(formData);
    const customer = await customerService.createCustomer(parsed);
    customerId = customer.id;
    revalidateSalesData();
    revalidatePath("/customers");
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menyimpan pelanggan"),
    };
  }

  if (formData.get("modal") === "true") {
    return { success: true as const, id: customerId };
  }

  redirect(getReturnTo(formData, "/customers"));
}

export async function saveCustomerAction(formData: FormData) {
  formData.set("modal", "true");
  return createCustomerAction(formData);
}

export async function updateCustomerAction(id: string, formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseCustomerFromForm(formData);
    await customerService.updateCustomer(id, parsed);
    revalidateSalesData();
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath("/");
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal memperbarui pelanggan"),
    };
  }

  if (formData.get("modal") === "true") {
    return { success: true as const };
  }

  redirect(getReturnTo(formData, `/customers/${id}`));
}

export async function deleteCustomerAction(id: string) {
  try {
    await requireAuth();
    await customerService.softDeleteCustomer(id);
    revalidateSalesData();
    revalidatePath("/customers");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menghapus pelanggan"),
    };
  }
}
