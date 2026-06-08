import { prisma, type ProductType } from "@hl/database";

export async function listProducts(search?: string) {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? { nama: { contains: search, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { nama: "asc" },
  });
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
