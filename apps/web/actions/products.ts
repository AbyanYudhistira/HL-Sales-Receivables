"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { revalidateProductData } from "@/lib/cache-tags";
import { getReturnTo } from "@/lib/safe-return-path";
import * as productService from "@/lib/services/products";

const productSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  hargaModal: z.coerce.number().min(0),
  hargaBase: z.coerce.number().min(0),
  tipe: z.enum(["LM", "BR"]),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function createProductAction(formData: FormData) {
  await requireAuth();

  const parsed = productSchema.parse({
    nama: formData.get("nama"),
    hargaModal: formData.get("hargaModal"),
    hargaBase: formData.get("hargaBase"),
    tipe: formData.get("tipe"),
  });

  const product = await productService.createProduct(parsed);
  revalidateProductData();
  revalidatePath("/products");

  if (formData.get("modal") === "true") {
    return { success: true as const, id: product.id };
  }

  redirect(getReturnTo(formData, "/products"));
}

export async function saveProductAction(formData: FormData) {
  await requireAuth();

  const parsed = productSchema.parse({
    nama: formData.get("nama"),
    hargaModal: formData.get("hargaModal"),
    hargaBase: formData.get("hargaBase"),
    tipe: formData.get("tipe"),
  });

  const product = await productService.createProduct(parsed);
  revalidateProductData();
  revalidatePath("/products");
  return { success: true as const, id: product.id };
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAuth();

  const parsed = productSchema.parse({
    nama: formData.get("nama"),
    hargaModal: formData.get("hargaModal"),
    hargaBase: formData.get("hargaBase"),
    tipe: formData.get("tipe"),
  });

  await productService.updateProduct(id, parsed);
  revalidateProductData();
  revalidatePath("/products");

  if (formData.get("modal") === "true") {
    return { success: true as const };
  }

  redirect(getReturnTo(formData, "/products"));
}

export async function deleteProductAction(id: string) {
  await requireAuth();
  await productService.softDeleteProduct(id);
  revalidateProductData();
  revalidatePath("/products");
}
