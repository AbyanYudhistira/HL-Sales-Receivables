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

  const updateAction = updateProductAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Produk</h1>
      <Card>
        <ProductForm
          action={updateAction}
          initial={{
            nama: product.nama,
            hargaModal: Number(product.hargaModal),
            hargaBase: Number(product.hargaBase),
            tipe: product.tipe,
          }}
          submitLabel="Perbarui"
        />
      </Card>
    </div>
  );
}
