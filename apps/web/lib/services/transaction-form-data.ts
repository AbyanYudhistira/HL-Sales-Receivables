import type { ProductType } from "@hl/database";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";

import * as customerService from "./customers";
import * as productService from "./products";
import * as transactionService from "./transactions";

export type TransactionFormCustomer = {
  id: string;
  nama: string;
  discountLm: unknown;
  discountBr: unknown;
  bonusAvailable: number;
};

export type TransactionFormProduct = {
  id: string;
  nama: string;
  tipe: ProductType;
  hargaBase: number;
  hargaModal: number;
};

export type TransactionFormData = {
  customers: TransactionFormCustomer[];
  products: TransactionFormProduct[];
};

async function fetchTransactionFormData(): Promise<TransactionFormData> {
  const customers = await customerService.listCustomers();
  const [products, bonusMap] = await Promise.all([
    productService.listProducts(),
    transactionService.getBonusAvailableMap(customers),
  ]);

  return {
    customers: customers.map((customer) => ({
      id: customer.id,
      nama: customer.nama,
      discountLm: customer.discountLm,
      discountBr: customer.discountBr,
      bonusAvailable: bonusMap.get(customer.id) ?? 0,
    })),
    products: products.map((product) => ({
      id: product.id,
      nama: product.nama,
      tipe: product.tipe as ProductType,
      hargaBase: Number(product.hargaBase),
      hargaModal: Number(product.hargaModal),
    })),
  };
}

const getCachedTransactionFormData = unstable_cache(
  fetchTransactionFormData,
  ["transaction-form-data"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.transactionForm],
  }
);

export async function getTransactionFormData(): Promise<TransactionFormData> {
  return getCachedTransactionFormData();
}
