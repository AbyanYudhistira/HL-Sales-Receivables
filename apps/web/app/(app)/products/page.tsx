import * as productService from "@/lib/services/products";

import { ProductsPageClient } from "@/components/products/products-page-client";

export default async function ProductsPage() {
  const products = await productService.listProducts();

  return (
    <ProductsPageClient
      products={products.map((product) => ({
        id: product.id,
        nama: product.nama,
        tipe: product.tipe,
        hargaBase: Number(product.hargaBase),
        hargaModal: Number(product.hargaModal),
      }))}
    />
  );
}
