import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  dashboard: "dashboard",
  reports: "reports",
  customersSummary: "customers-summary",
  transactionsList: "transactions-list",
  transactionForm: "transaction-form",
  products: "products",
} as const;

export const CACHE_REVALIDATE_SECONDS = 60;

export function revalidateSalesData() {
  revalidateTag(CACHE_TAGS.dashboard);
  revalidateTag(CACHE_TAGS.reports);
  revalidateTag(CACHE_TAGS.customersSummary);
  revalidateTag(CACHE_TAGS.transactionsList);
  revalidateTag(CACHE_TAGS.transactionForm);
}

export function revalidateProductData() {
  revalidateTag(CACHE_TAGS.products);
  revalidateTag(CACHE_TAGS.transactionForm);
}
