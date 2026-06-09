import { notFound } from "next/navigation";

import { updateProductAction } from "@/actions/products";
import { ProductForm } from "@/components/products/product-form";
import { Card } from "@/components/ui/card";
import * as productService from "@/lib/services/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await productService.getProductById(id);
  if (!product) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateProductAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">Edit Barang</h1>
      <Card>
        <ProductForm
          action={action}
          initial={{
            nama: product.nama,
            hargaModal: Number(product.hargaModal),
            hargaBase: Number(product.hargaBase),
            tipe: product.tipe,
          }}
          submitLabel="Simpan"
        />
      </Card>
    </div>
  );
}
