"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { formatActionError } from "@/lib/action-error";
import { revalidateProductData } from "@/lib/cache-tags";
import { parseProductFromForm } from "@/lib/schemas/product";
import { getReturnTo } from "@/lib/safe-return-path";
import * as productService from "@/lib/services/products";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function createProductAction(formData: FormData) {
  await requireAuth();

  let productId: string;
  try {
    const parsed = parseProductFromForm(formData);
    const product = await productService.createProduct(parsed);
    productId = product.id;
    revalidateProductData();
    revalidatePath("/products");
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menyimpan barang"),
    };
  }

  if (formData.get("modal") === "true") {
    return { success: true as const, id: productId };
  }

  redirect(getReturnTo(formData, "/products"));
}

export async function saveProductAction(formData: FormData) {
  formData.set("modal", "true");
  return createProductAction(formData);
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAuth();

  try {
    const parsed = parseProductFromForm(formData);
    await productService.updateProduct(id, parsed);
    revalidateProductData();
    revalidatePath("/products");
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal memperbarui barang"),
    };
  }

  if (formData.get("modal") === "true") {
    return { success: true as const };
  }

  redirect(getReturnTo(formData, "/products"));
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    await productService.softDeleteProduct(id);
    revalidateProductData();
    revalidatePath("/products");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: formatActionError(error, "Gagal menghapus barang"),
    };
  }
}
