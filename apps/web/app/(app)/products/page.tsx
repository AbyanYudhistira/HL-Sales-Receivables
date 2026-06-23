import * as productService from "@/lib/services/products";
import { parseListSearchParams } from "@/lib/parse-search-params";

import { ProductsPageClient } from "@/components/products/products-page-client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const query = await searchParams;
  const { search, page } = parseListSearchParams(query);

  const result = await productService.listProductsForTable({ search, page });

  return (
    <ProductsPageClient
      initialSearch={search}
      initialPage={page}
      totalCount={result.totalCount}
      products={result.rows.map((product) => ({
        id: product.id,
        nama: product.nama,
        tipe: product.tipe,
        hargaBase: Number(product.hargaBase),
        hargaModal: Number(product.hargaModal),
      }))}
    />
  );
}
