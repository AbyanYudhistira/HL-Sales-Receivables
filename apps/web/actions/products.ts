"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
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

  await productService.createProduct(parsed);
  revalidatePath("/products");
  redirect("/products");
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
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProductAction(id: string) {
  await requireAuth();
  await productService.softDeleteProduct(id);
  revalidatePath("/products");
}
