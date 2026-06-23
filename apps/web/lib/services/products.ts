import { prisma, type ProductType } from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants";

async function fetchProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { nama: "asc" },
  });
}

const getCachedProducts = unstable_cache(fetchProducts, ["products-list"], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.products, CACHE_TAGS.transactionForm],
});

export async function listProducts(search?: string) {
  if (search) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        nama: { contains: search, mode: "insensitive" as const },
      },
      orderBy: { nama: "asc" },
    });
  }

  return getCachedProducts();
}

export async function getProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createProduct(data: {
  nama: string;
  hargaModal: number;
  hargaBase: number;
  tipe: ProductType;
}) {
  return prisma.product.create({ data });
}

export async function updateProduct(
  id: string,
  data: {
    nama: string;
    hargaModal: number;
    hargaBase: number;
    tipe: ProductType;
  }
) {
  return prisma.product.update({ where: { id }, data });
}

export async function softDeleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export type ProductTableResult = {
  rows: Awaited<ReturnType<typeof listProducts>>;
  totalCount: number;
};

export async function listProductsForTable(options: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<ProductTableResult> {
  const pageSize = options.pageSize ?? PRODUCTS_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);
  const search = options.search?.trim();

  const where = {
    deletedAt: null,
    ...(search ? { nama: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [totalCount, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { nama: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { rows, totalCount };
}
